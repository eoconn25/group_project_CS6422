# Daisy Devs 🌸

This repository is for our _CS6422: Complex Systems Development_ group project, aimed at creating a smart companion for understanding Flower Language.  

**Group members:** Caylum Collier, Ethan O'Connor, Kellie O'Donovan, and Ciara O'Riordan.

### Topic and Motivation

- The art of arranging bouquets has an underlying <ins>flower language</ins> that conveys messages through flower species and color

- The symbolism of flower language is extensive, creating a steep learning curve

- Our app will serve as a <ins>smart companion tool</ins> allowing florists to arrange meaningful bouquets tailored to any occasion

### Proposed System
- <ins>Database:</ins> Relational tables containing physical characteristics, symbolism, and common pairings for various species of flowers

- <ins>AI Integration:</ins> CNN trained for flower species classification and a pipeline for prompting an LLM for written descriptions

- <ins>Back End:</ins> A login system allowing past queries to be saved

- <ins>Front End:</ins> A pleasant UI where the user can prompt the system, upload images of flowers,  and generate ideas for arrangements

### Organization
The Github is organized into the following folders:
- **model_training:** Framework for the fine-tuning of our classification model
- **frontend:** The orgiansation of the files related to front-end development
- Some other folder that the rest of the gang can create for backend/UI/etc. code

### Database
The data for fine-tuning our classification model to recognize flower species will be sourced from Kaggle.  The following publicly available dataset has over 15,700 images across 16 different species of flowers: https://www.kaggle.com/datasets/l3llff/flowers

Stay tuned for more to come!
