
class Config():
    def __init__(self):
        self.device = 'cuda'
        self.seed = 25

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
        self.main_csv = 'data/images.csv'

        # training parameters
        self.n_folds = 5
        self.epochs = 50

