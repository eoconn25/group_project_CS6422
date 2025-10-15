# load kaggle dataset
import os
import pandas as pd
import torch
from torch.utils.data import Dataset
import torchvision.transforms as T

transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],  # imagenet stats
            std=[0.229, 0.224, 0.225])
])

class FlowerData(Dataset):
    def __init__(self, config, encode_species, encode_color):
        # load df
        df = pd.read_csv(config.main_csv)
        self.samples = []
        
        # functions that will encode labels
        self.encode_species = encode_species
        self.encode_color = encode_color

        # append path and labels
        for index, row in df.iterrows():
            path = 'data/' + str(row['Mask Path'])
            species = self.encode_species[str(row['Species'])]
            color = self.encode_color[str(row['color_label'])]
            #print(color, species, path)
            self.samples.append((path, species, color))
        #print(len(self.samples))
        
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self,idx):
        path, species, color = self.samples[idx]
        image = torch.load(path)
        #print(image.shape)
        image = transform(image)
        #print(image.shape)

        return image, torch.tensor(species, dtype=torch.long), torch.tensor(color, dtype=torch.long)


'''encode_species = {'astilbe': 0, 
                  'bellflower': 1, 
                  'black_eyed_susan': 2, 
                  'calendula': 3, 
                  'california_poppy': 4, 
                  'carnation': 5, 
                  'common_daisy': 6, 
                  'coreopsis': 7, 
                  'daffodil': 8, 
                  'dandelion': 9, 
                  'iris': 10, 
                  'magnolia': 11, 
                  'rose': 12, 
                  'sunflower': 13, 
                  'tulip': 14, 
                  'water_lily': 15
}
encode_color = {'white': 0, 'yellow': 1, 'orange': 2, 'pink': 3, 'red': 4, 'purple': 5, 'maroon': 6, 'brown': 7}

cfg = Config()
FlowerData(cfg, encode_species, encode_color)'''