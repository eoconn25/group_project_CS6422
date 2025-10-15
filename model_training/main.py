import torch
from torch.utils.data import DataLoader, Subset
from sklearn.model_selection import train_test_split
import csv
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

from config import Config
from data.dataset import FlowerData
from models.model_init import get_model
from models.train import train

# dictionaries to encode flower and color labels
encode_species = {'astilbe': 0, 'bellflower': 1, 'black_eyed_susan': 2, 'calendula': 3, 'california_poppy': 4, 
                  'carnation': 5, 'common_daisy': 6, 'coreopsis': 7, 'daffodil': 8, 'dandelion': 9, 
                  'iris': 10, 'magnolia': 11, 'rose': 12, 'sunflower': 13, 'tulip': 14, 'water_lily': 15
}
encode_color = {'white': 0, 'yellow': 1, 'orange': 2, 'pink': 3, 'red': 4, 'purple': 5, 'maroon': 6, 'brown': 7}


# orchestrates model training
def main(config, saver):
    # load full dataset
    full_dataset = FlowerData(config, encode_species, encode_color)

    # get indices for train/val split
    indices = list(range(len(full_dataset)))
    train_idx, val_idx = train_test_split(indices, test_size = config.val_split, random_state=config.seed, shuffle=True)

    train_subset = Subset(full_dataset, train_idx)
    val_subset = Subset(full_dataset, val_idx)

    train_loader = DataLoader(train_subset, batch_size = config.batch_size, shuffle=True, num_workers=config.num_workers, pin_memory=True, persistent_workers=True)
    val_loader = DataLoader(val_subset, batch_size = config.batch_size, shuffle=False, num_workers=config.num_workers, pin_memory=True, persistent_workers=True)

    # get CNN model
    model = get_model(config)
    model.to(config.device)

    # train model
    train(config, model, saver, train_loader, val_loader)


if __name__=='__main__':
    print(f'CUDA? {torch.cuda.is_available()}')
    print(f'Device? {torch.cuda.current_device()}')

    cfg = Config()
    main(cfg, 'test1.2')    
