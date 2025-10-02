import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models

# resnet
class SimpleResnet(nn.module):
    def __init__(self, num_classes):
        super().__init__()
        # Load pretrained ResNet50
        self.backbone = models.resnet50(pretrained=True)
        self.freeze_resnet(self.backbone)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()  # outputs the resnet-extraced features

        # Simple classifier head
        self.classifier = nn.Sequential(
            #nn.Linear(2048, 512),
            #nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(in_features, num_classes)  # outpus a tuple - one for color, one for flower species
        )

    @staticmethod
    def freeze_resnet(model):
        for param in model.parameters():
            param.requires_grad = False

    def forward(self, x):
        feats = self.backbone(x)  # gets (batch, 2048)
        out = self.classifier(feats)  # gets tuple of classification
        '''feats = self.backbone.conv1(x)
        feats = self.backbone.bn1(feats)
        feats = self.backbone.relu(feats)
        feats = self.backbone.maxpool(feats)
        feats = self.backbone.layer1(feats)
        feats = self.backbone.layer2(feats)
        feats = self.backbone.layer3(feats)
        feats = self.backbone.layer4(feats)'''    
        return out
    

def get_model(config):
    return SimpleResnet(config.num_classes)