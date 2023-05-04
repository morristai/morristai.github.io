---
title: "Pandas ufuncs小技巧"
date: 2017-08-26T11:16:25+08:00
draft: false
tags: ["pandas", "ufuncs"]
---

> `Pandas`的`ufuncs`為什麼比`apply command`還建議使用?

Pandas 有一個`apply function`讓你可以針對所有在column的值執行任何functions。注意apply只是比python內建的loop還要快一點點而已！這就是為什麼pandas的內建ufuncs比較推薦使用在columns的預處理(preprocessing)。\
`ufuncs`是特殊functions(建構在numpy的library)裡面並由**C**來實行，這就是為何`ufuncs`會如此之快。以下會介紹幾種`ufuncs`的例子`(.diff, .shift, .cumsum, .cumcount, .str commands (作用在字串), .dt commands (作用在日期))`。

## 範例數據 — 暑期活動
這裡透過下面的數據集來演示pandas的ufuncs(同一個人可以在不同的時間軸上進行不同的活動)
![pandas_ufuncs_dataset](/images/pandas_ufuncs_1.jpeg)

這裏假設我們的任務是要基於上面的數據集去預測**誰是最有趣的同學**
## 1. String commands
![pandas_ufuncs_dataset](/images/pandas_ufuncs_2.jpeg)
如果我們想要對字串做切割的話，string commands (which are Ufuncs)是最推薦的：
{{< highlight python>}}
df['name'] = df.name.str.split(" ", expand=True)
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_3.jpeg)
除此之外你可以用[pandas.Series.str.replace](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.Series.str.replace.html)來更有效的清理字串。

## 2. Group by and value_counts
透過`groupby`和`value_counts`我們可以輕鬆數出每個人做過多少次活動：
{{< highlight python>}}
df.groupby('name')['activity'].value_counts()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_4.jpeg)
這稱為[multi index](https://pandas.pydata.org/pandas-docs/stable/user_guide/advanced.html)，它可以讓我們同時在dataframe中擁有不同的index層，在圖片中人名就是level 0而activity是level 1。

## 3. Unstack
我們也可以創建每個人的活動計數特徵，透過`unstack`方法，可以將行與列互換，`unstack`會把最低level的index轉換成cloumns，每個人的活動計數會變成cloumns，對於沒有從事該活動的人欄位會維持缺失值`NaN`，可以對其進行缺失值填補。
{{< highlight python>}}
df.groupby('name')['activity'].value_counts().unstack().fillna(0)
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_5.jpeg)

## 4. groupby, diff, shift, and loc + A great tip for efficiency
如果能了解一個人在活動中從事的時間，必定能對我們了解誰是最有趣的人有幫助。誰在party待最久？誰在海邊待最久？
對於時間長短最有效的推算方式就是先使用`groupby`歸類人名，再用`diff()`算出時間差:
{{< highlight python>}}
df = df.sort_values(by=['name','timestamp'])
df['time_diff'] = df.groupby('name')['timestamp'].diff()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_6.jpeg)
如果你有大量的數據集，你可以跳過`groupby`，只做資料排序，刪除每個人的第一行(不相關的)後直接用`diff`。
{{< highlight python>}}
df = df.sort_values(by=['name','timestamp'])
df['time_diff'] = df['timestamp'].diff()
df.loc[df.name != df.name.shift(), 'time_diff'] = None
{{< / highlight >}}
順便一提 ⎯ `.shift`可以將每一行向下移動ㄧ格，所以我們就可以用`df.name!=df.name.shift()`看看哪一行有改變。
然後`.loc`是最推薦用來在特定的indices的columns中set values的選擇！\
接著我們把`time_diff`單位改成秒：
{{< highlight python>}}
df['time_diff'] = df.time_diff.dt.total_seconds()
{{< / highlight >}}
獲取每個row的持續時間：
{{< highlight python>}}
df['row_duration'] = df.time_diff.shift(-1)
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_7.jpeg)

## 5. Cumcount and Cumsum
`Cumcount`可以創建一個累積計數。舉個例子，我們可以單獨把每個人的第二項活動提取出來，透過`groupby(‘name’)`之後`apply cumcount`(關於cumcount可以見[這裡](http://python.usyiyi.cn/documents/Pandas_0j2/generated/pandas.core.groupby.GroupBy.cumcount.html))。因為
`cumcount`從0開始排序，所以如果我們想知道每個人的第二個活動，我們可以==1(第三個活動==2)
{{< highlight python>}}
df = df.sort_values(by=['name','timestamp'])
df2 = df[df.groupby('name').cumcount()==1]
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_8.jpeg)
{{< highlight python>}}
df = df.sort_values(by=['name','timestamp'])
df2 = df[df.groupby('name').cumcount()==2]
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_9.jpeg)
`cumsum`就只是對數字欄位的累加總和，我們可以把每個人在不同活動中所花的錢不斷累加。
{{< highlight python>}}
df = df.sort_values(by=['name','timestamp'])
df['money_spent_so_far'] = df.groupby(‘name’)['money_spent'].cumsum()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_10.jpeg)
## 6. groupby, max, min for measuring the duration of activities
在之前我們試過看看每個人在每一個活動中花了多少時間，但是我們忽略了有時候兩個活動其實是同一活動的連續！為了得知真正的活動進行時間，我們必須從連續活動的一開始測量到最後結束。這裡我們使用`.shift`和`.cumsum`去創建新特徵值activity_change
{{< highlight python>}}
df['activity_change'] = (df.activity!=df.activity.shift()) | (df.name!=df.name.shift())
{{< / highlight >}}
接著我們將透過`.cumsum`去計算每個人的活動數
{{< highlight python>}}
df['activity_num'] = df.groupby('name')['activity_change'].cumsum()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_11.jpeg)
現在我們可以利用活動持續時間透過分組每個人和活動數(還有活動名稱，雖然並不會改變分組結果但是我們需要再結果出現活動名稱)後計算每行的活動持續時間總和。
{{< highlight python>}}
activity_duration = df.groupby(['name','activity_num','activity'])['activity_duration'].sum()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_12.jpeg)
這樣會返回一個類似timedelta type的活動時間。你可以用`.dt.total_seconds`得知
{{< highlight python>}}
activity_duration = activity_duration.dt.total_seconds()
{{< / highlight >}}
最後你可以用中位數或平均數對每個人的活動持續時間最大/最小化
{{< highlight python>}}
activity_duration = activity_duration.reset_index().groupby('name').max()
{{< / highlight >}}
![pandas_ufuncs_dataset](/images/pandas_ufuncs_13.jpeg)

出處:參考[原文](https://medium.com/towards-data-science/pandas-tips-and-tricks-33bcc8a40bb9)