import torch
import torch.nn as nn
from torchvision import models

# resnet
class SimpleResnet(nn.Module):
    def __init__(self, num_species, num_colors):
        super().__init__()
        # load pretrained ResNet50
        self.backbone = models.resnet50(pretrained=True)
        self.freeze_resnet(self.backbone)

        # change classification head with the identity
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()  # outputs the resnet-extracted features

        # classifier head for species
        self.species_classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(in_features, num_species)
        )
        # classifier head for, you guessed it, color
        self.color_classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(in_features, num_colors)
        )

    @staticmethod
    def freeze_resnet(model):
        for param in model.parameters():
            param.requires_grad = False

    def forward(self, x):
        feats = self.backbone(x)  # gets (batch, 2048)
        species_logits = self.species_classifier(feats)  # gets classifications
        color_logits = self.color_classifier(feats)
        return species_logits, color_logits
    

def get_model(config):
    return SimpleResnet(config.num_species, config.num_colors)