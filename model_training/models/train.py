# training loop
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler
from tqdm import tqdm
import logging
import csv

def train(config, model, fold, train_loader, val_loader):
    pass
