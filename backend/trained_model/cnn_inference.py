# class to call for inference on an uploaded image
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
from torchvision import transforms
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
warnings.simplefilter(action='ignore', category=UserWarning)
from model_init import get_model


class ClassifyFlower:
    def __init__(self, 
                 model_arch, 
                 weights_path:str='test1.2_best_model.pt', 
                 seg_path:str='flowers_segmentation_model.pt'):
        '''
        model_arch: function for returning model instance/architecture
        model_weights: PATH to the model's weights
        seg_path: PATH to the pretrained YOLO model for image segmentation/masking
        '''
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

        # initialize trained model
        self.model = model_arch().to(self.device)
        self.model.load_state_dict(torch.load(weights_path))
        self.model.eval()

        self.seg_path = seg_path # path to segmentation model
        
        # image transformations for segmentation model
        self.segmentation_transform = transforms.Compose([
            transforms.Resize((640, 640)),
            transforms.ToTensor(),
        ])

        # image transformations for inference model
        self.inference_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

        # dictionary for decoding predictions
        self.decode_species = {
            0: 'astilbe', 1: 'bellflower', 2: 'black_eyed_susan', 3: 'calendula', 4: 'california_poppy', 
            5: 'carnation', 6: 'common_daisy', 7: 'coreopsis', 8: 'daffodil', 9: 'dandelion', 
            10: 'iris', 11: 'magnolia', 12: 'rose', 13: 'sunflower', 14: 'tulip', 15: 'water_lily'
        }
        self.decode_color = {
            0: 'white', 1: 'yellow', 2: 'orange', 3: 'pink', 4: 'red', 5: 'purple', 6: 'maroon', 7: 'brown'
        }


    # preprocess image
    def load_image(self, image_path):
        error = False

        # load pretrained segmentation model
        seg_model = YOLO(self.seg_path)
        seg_model.eval()
        
        # load image, prep for processing (Image supports .png, .jpg, etc.)
        img_rgb = Image.open(image_path).convert('RGB')
        img_tensor = self.segmentation_transform(img_rgb).unsqueeze(0)

        # preprocess - threshold is 15% confidence
        results = seg_model.predict(img_rgb, conf=0.15, save=False, show=False, verbose=False)
        r = results[0]
        if len(r.boxes) == 0:
            print("No flowers here, fam")
            error = True
            return None, error

        # identify highest scoring mask, create binary mask
        scores = r.boxes.conf.cpu().numpy()
        idx_max = scores.argmax()
        best_mask = r.masks.data[idx_max].cpu().numpy()
        mask_pil = Image.fromarray((best_mask * 255).astype(np.uint8))
        mask_pil = mask_pil.resize((640, 640), Image.Resampling.NEAREST)
        best_mask = np.array(mask_pil).astype(np.float32) / 255.0

        binary_mask = (best_mask > 0.5).astype(np.uint8)
        binary_mask = np.stack([binary_mask]*3, axis=-1)

        img_rgb = img_tensor.squeeze(0).permute(1,2,0).cpu().numpy()

        # apply mask
        flower =  img_rgb * binary_mask
        flower = Image.fromarray((flower * 255).astype(np.uint8))
        flower = self.inference_transform(flower).unsqueeze(0).to(self.device)

        return flower, error

    
    @torch.no_grad()
    def predict(self, image_path):
        # run inference on single image
        tensor, error = self.load_image(image_path)

        if error == True:
            print(f'error: no flower was detected')
            return None, None
        else:
            species_logits, color_logits = self.model(tensor)
            _, species_pred = torch.max(species_logits, dim=1)
            _, color_pred = torch.max(color_logits, dim=1)

            species_pred = self.decode_species[species_pred.item()]
            color_pred = self.decode_color[color_pred.item()]

            return species_pred, color_pred


### example use
if __name__== '__main__':
    weights_path = 'test1.2_best_model.pt'
    seg_path = 'flowers_segmentation_model.pt'

    clfr = ClassifyFlower(get_model, weights_path, seg_path)  #instantiate class

    # will need to fix file path stuff
    image_path = '143797170_05482613ac_c.jpg'
    species, color = clfr.predict(image_path)  # predict image
    print(f'\033[32m Species: {species}, Color: {color}\033[0m')