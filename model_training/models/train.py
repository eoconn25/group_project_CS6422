import torch
import torch.nn as nn
import torch.optim as optim
import csv
from tqdm import tqdm
import os
from sklearn.metrics import f1_score

# function to unfreeze our model layer by layer
def unfreeze_model_layer(model, step, optimizer, lr):
    new_params = []

    # unfreeze resnet step by step
    resnet_layers = ["layer4", "layer3", "layer2", "layer1"]
    if step <= 0 or step > len(resnet_layers):
        return  # nothing to unfreeze
    
    layer_to_unfreeze = resnet_layers[step - 1]
    print(f"Unfreezing {layer_to_unfreeze}")

    layer = getattr(model.backbone, layer_to_unfreeze)
    for param in layer.parameters():
        if not param.requires_grad:
            param.requires_grad = True
            new_params.append(param)
    
    if new_params:
        #print(f"Adding {len(new_params)} params to optimizer")
        optimizer.add_param_group({'params': new_params, 'lr': lr})


# training loop
def train(config, model, saver, train_loader, val_loader):
    # set up csv for logging
    os.makedirs("output", exist_ok=True)
    csv_file = open(f'output/{saver}.csv', mode='w', newline='')
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['Epoch', 'Train Loss', 'Train Species Accuracy', 'Train Color Accuracy',
                         'Val Loss', 'Val Species Accuracy', 'Val Color Accuracy',
                         'Species F1', 'Colors F1', 'Avg F1'])

    # set up training params
    device = config.device
    criterion = nn.CrossEntropyLoss().to(device)
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()),
                                   lr = config.lr, 
                                   weight_decay = config.weight_decay)

    # unfreezing model params
    unfreeze_step = 0

    best_f1 = 0.0
    patience_counter = 0

    for epoch in range(config.epochs):
        if epoch % 3 == 0 and epoch != 0:
            current_lr = optimizer.param_groups[0]['lr']
            unfreeze_step += 1
            unfreeze_model_layer(model, unfreeze_step, optimizer, current_lr)

        ### initiate model training ###
        model.train()
        running_loss = 0.0
        correct_species, correct_color, total = 0, 0, 0

        for batch_idx, (image, species_label, color_label) in enumerate(tqdm(train_loader, desc=f'Training Epoch {epoch}')):
            # prepare features for model
            image = image.to(device)
            species_label = species_label.to(device)
            color_label = color_label.to(device)

            optimizer.zero_grad()

            # make predictions and calculate loss
            species_logits, color_logits = model(image)
            species_loss = criterion(species_logits, species_label)  # loss for species dim
            color_loss = criterion(color_logits, color_label)  # loss for color dim
            loss = species_loss + color_loss  # combine loss

            # update yo self
            loss.backward()
            optimizer.step()

            # calculate running 
            running_loss += loss.item()

            # calculate accuracies
            _, species_pred = torch.max(species_logits, dim=1)
            _, color_pred = torch.max(color_logits, dim=1)

            correct_species += (species_pred == species_label).sum().item()
            correct_color += (color_pred == color_label).sum().item()
            total += species_label.size(0)
        
        # calculate aggregated stats
        train_loss_avg = running_loss / len(train_loader)
        species_acc = correct_species / total
        color_acc = correct_color / total

        ### initiate validation ###
        model.eval()
        val_loss = 0.0
        correct_species, correct_color, total = 0, 0, 0

        # store predictions and labels for F1
        all_species_preds, all_species_labels = [], []
        all_color_preds, all_color_labels = [], []

        with torch.no_grad():
            for batch_idx, (image, species_label, color_label) in enumerate(tqdm(val_loader, desc=f'Validation Epoch {epoch}')):
                # prep
                image = image.to(device)
                species_label = species_label.to(device)
                color_label = color_label.to(device)
                
                # make predictions and calculate loss
                species_logits, color_logits = model(image)
                species_loss = criterion(species_logits, species_label)  # loss for species dim
                color_loss = criterion(color_logits, color_label)  # loss for color dim
                loss = species_loss + color_loss  # combine loss

                # calculate loss 
                val_loss += loss.item()

                # calculate accuracies
                _, species_pred = torch.max(species_logits, dim=1)
                _, color_pred = torch.max(color_logits, dim=1)

                correct_species += (species_pred == species_label).sum().item()
                correct_color += (color_pred == color_label).sum().item()
                total += species_label.size(0)

                # collect F1 business
                all_species_preds.append(species_pred.cpu())
                all_species_labels.append(species_label.cpu())
                all_color_preds.append(color_pred.cpu())
                all_color_labels.append(color_label.cpu())
            
        # calculate aggregated stats
        val_loss_avg = val_loss / len(val_loader)
        val_species_acc = correct_species / total
        val_color_acc = correct_color / total

        # aggregate F1 business
        all_species_preds = torch.cat(all_species_preds)
        all_species_labels = torch.cat(all_species_labels)
        all_color_preds = torch.cat(all_color_preds)
        all_color_labels = torch.cat(all_color_labels)

        # compute F1 business
        species_f1 = f1_score(all_species_labels.numpy(), all_species_preds.numpy(), average='macro')
        color_f1 = f1_score(all_color_labels.numpy(), all_color_preds.numpy(), average='macro')
        avg_f1 = (species_f1 + color_f1) / 2

        print(f"Epoch [{epoch}/{config.epochs}] "
              f"Train Loss: {train_loss_avg:.4f} | Val Loss: {val_loss_avg:.4f} | "
              f"Species Acc: {val_species_acc:.3f} | Color Acc: {val_color_acc:.3f} | "
              f"Species F1: {species_f1:.3f} | Color F1: {color_f1:.3f} | Avg F1: {avg_f1:.3f}")
        
        csv_writer.writerow([epoch, train_loss_avg, species_acc, color_acc, 
                             val_loss_avg, val_species_acc, val_color_acc, 
                             species_f1, color_f1, avg_f1])
        csv_file.flush()
        
        ### early stopping ###
        if avg_f1 > best_f1:
            best_f1 = avg_f1
            patience_counter = 0
            torch.save(model.state_dict(), f'output/{saver}_best_model.pt')
            print(f'\033[34m New Best F1: {avg_f1}; model saved \033[0;0m')
        else:
            patience_counter += 1
    
        if patience_counter >= 10:
            print(f'Early stopping epoch {epoch}')
            break

    csv_file.close()
        
        




