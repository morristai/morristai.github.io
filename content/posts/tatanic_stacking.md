---
title: "Notes on the Kaggle Titanic Stacking Model"
date: 2017-08-17T11:51:08+08:00
draft: false
tags: ["kaggle", "stacking"]
---

While reading through [Kaggle](https://google.com) kernels for the Titanic challenge, many of them use SVM, RandomForest, LogisticRegression, etc. What makes this particular kernel interesting is that it builds a model from six different learners:\
[Introduction to Ensembling/Stacking in Python Using data from Titanic: Machine Learning from Disaster](https://www.kaggle.com/arthurtok/introduction-to-ensembling-stacking-in-python)\
At Level 1 it uses `RandomForestClassifier`, `AdaBoostClassifier`, `GradientBoostingClassifier`, `ExtraTreesClassifier`, and `SVM`, and at Level 2 it uses `XGBoost`.
I sketched the overall flow of the model to make it easier to understand — the raw source is hard to parse quickly. The author cleverly uses classes to keep the notebook code clean, which also makes it easier to modify and organize later.

<!-- NOTE: There was originally a self-drawn stacking flow diagram here (/images/tatanic_stacking.png). The image file has been lost; TODO replace. -->
> _(Image missing: this spot originally showed a Level 1 / Level 2 stacking flow diagram, illustrating how out-of-fold predictions from 5 base learners are combined to form the training/test data for the XGBoost meta-learner.)_

### Level 1
The most important part here is the data handling. Kaggle gives us two files: train and test, where `train.shape` = (891, 12) and `test.shape` = (418, 11).
After splitting `train` with cross-validation, you get five 178-row slices. Since we have 5 folds and 5 models, this is where it's easy to get confused. So let's walk through Model 1 (Random Forest) as an example: we split `train` into 5 folds, feed them into Random Forest, with the first fold using 713 people as the training set and 178 as the validation set, the second fold swapping in a different 713 as the training set and 178 as validation, and so on. The predictions from all validation sets combine into a 178 × 4 + 179 = 891 `et_oof_train` array. (Careful! When `KFold` splits our data into 5 parts, the first part is actually 712 × 179 while the rest are 713 × 178 — I got stuck on that for a while...)
Repeat this for each model and you get five `out-of-fold_train` arrays. Combined, they form an 891 × 5 training set — the training set for XGBoost.
Where does XGBoost's test set come from? Continuing the Random Forest example: we split the training set into 5 folds, producing 5 Random Forest models. Each of those 5 models predicts on `test`, giving us 5 × 418 predictions. We average these and reshape to (-1, 1), yielding a (418,) ndarray with values between 0 and 1.
Since we have 5 models, the final `x_test` has 418 × 5 entries.
### Level 2
Finally, in XGBoost it's just a matter of tuning parameters. Here are the author's parameters for reference:
```python
gbm = xgb.XGBClassifier(
 #learning_rate = 0.02,
 n_estimators= 2000,
 max_depth= 4,
 min_child_weight= 2,
 #gamma=1,
 gamma=0.9, 
 subsample=0.8,
 colsample_bytree=0.8,
 objective= ‘binary:logistic’,
 nthread= -1,
 scale_pos_weight=1).fit(x_train, y_train)
predictions = gbm.predict(x_test)
```
And that basically completes our stacking model.
Corrections are welcome if I got anything wrong.
