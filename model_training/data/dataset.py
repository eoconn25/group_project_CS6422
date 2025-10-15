# load kaggle dataset
import os
import pandas as pd
import torch
from torch.utils.data import Dataset

class FlowerData(Dataset):
    def __init__(self, config):
        df = pd.read_csv(config.main_csv)
        self.samples = df['Mask Path'].tolist()
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self,idx):
        image = torch.load(self.samples[idx])
        image = torch.from_numpy(image).permute((2,0,1))


