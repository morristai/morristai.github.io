---
title: "Kaggle Tatanic Stacking 學習模型整理"
date: 2017-08-17T11:51:08+08:00
draft: false
tags: ["kaggle", "stacking"]
---

在看過[Kaggle](https://google.com)上Titanic的一些kernels，其中不乏用SVM, RandomForest, LogisticRegression, etc. 而這Kernel有趣的是他利用6種不同的learning models去建模。\
[Introduction to Ensembling/Stacking in Python Using data from Titanic: Machine Learning from Disaster](https://www.kaggle.com/arthurtok/introduction-to-ensembling-stacking-in-python)\
在Level 1用了`RandomForestClassifier`, `AdaBoostClassifier`, `GradientBoostingClassifier`, `ExtraTreesClassifier`, `SVM`，而Level 2用了`XGBoost`。
我大致畫出整個模型的流程架構，以便於理解，光看源碼其實很難短時間理解在幹嘛，作者靈活的用了class來降低在jupyter notebook內程式碼的複雜度，方便之後修改和整理。

![tatanic_stacking_flow](/images/tatanic_stacking.png)

### Level 1
這裡最重要的是數據處理，Kaggle只給了我們兩份資料：train ＆ test，其中`train.shape` = (891, 12)，`test.shape` = (418,11)。
用交叉驗證切割train之後會有178 x 5的數據集，由於我們n-fold有五組，Model也有五個，這裡容易腦袋打結。所以我們先用model 1(隨機森林)舉例：train切成五組之後丟給隨機森林訓練，第一組有713人當訓練集，178人當驗證集(validation set)，第二組則換成另一批713人當訓練集，178人當驗證集，以此類推。驗證出來的答案打包成一組178 x 4+179剛好成為891的et_oof_train(注意！KFold把我們的資料切成5份時，實際上是把第一份切成712 x 179，其餘切成713 x 178，我就是卡在這裡..囧)。
當我們對每個模型這樣做的時候，就得到五個out-of-fold_train，結合在一起就變成891 x 5的訓練集(就是XGBoost的訓練集)！
那XGBoost的測試集哪裡來？再用剛剛隨機森林做例子：我們把訓練集分成五組，所訓練出來的隨機森林就有5個，現在就用5個隨機森林去對test預測，所預測出來的結果就是之5 x 418! 我們在將其求平均並reshape(-1, 1)，所得到的結果是(418,)的ndarray，數值介在0~1之間。
又我們有5個models，所以最後的x_test有418 x 5個數。
### Level 2
最後在XGBoost中剩下調參數了，放一下作者的參數做參考
{{< highlight python>}}
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
{{< / highlight >}}
這樣基本上就完成我們的stacking模型了~
如有錯誤歡迎指正
