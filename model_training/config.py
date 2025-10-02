
class Config():
    def __init__(self):
        # model parameters
        self.num_classes = 2  # color and species

        # preprocessing parameters
        self.patch_size = 0
        self.stride = 0
        self.threshold = 0
        self.num_patches0 = 0

        # dataset params
        self.train_dir = 'n'
        self.test_dir = 'n'

        # training parameters
        self.epochs = 50
