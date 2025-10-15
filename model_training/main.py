# orchestrates model training
import torch
from torch.utils.data import DataLoader, Subset
from sklearn.model_selection import KFold

from config import Config
from data.dataset import FlowerData
from models.model_init import get_model
from models.train import train

import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

def main(config):
    full_dataset = FlowerData(config)

    kf = KFold(n_splits=config.n_folds, shuffle = True, random_state=config.seed)

    for fold, (train_idx, val_idx) in enumerate(kf.split(full_dataset)):
        print(f'\n\033[32mFold {fold}/{config.n_folds}\033[0m')

        # subset data for k-fold CV
        train_subset = Subset(full_dataset, train_idx)
        val_subset = Subset(full_dataset, val_idx)

        # make data loaders for training and val
        train_loader = DataLoader(train_subset, batch_size = config.batch_size, shuffle=True, num_workers=config.num_workers, pin_memory=True, persistent_workers=True)
        val_loader = DataLoader(val_subset, batch_size = config.batch_size, shuffle=False, num_workers=config.num_workers, pin_memory=True, persistent_workers=True)

        # get CNN model
        model = get_model(config)

        # train model
        train(config, model, fold, train_loader, val_loader)

if __name__=='__main__':
    print(f'CUDA? {torch.cuda.is_available()}')
    print(f'Device? {torch.cuda.current_device()}')

    cfg = Config()
    main(cfg)    
