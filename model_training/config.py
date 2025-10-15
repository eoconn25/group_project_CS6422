
class Config():
    def __init__(self):
        self.seed = 25
        self.device = 'cuda'

        # model parameters
        self.num_species = 16
        self.num_colors = 8

        # dataset params
        self.main_csv = 'data/flower_colors_labeled.csv'
        self.val_split = 0.3

        # training parameters
        self.epochs = 50
        self.batch_size = 16
        self.num_workers = 4
        self.lr = 0.001
        self.weight_decay = 1e-5

