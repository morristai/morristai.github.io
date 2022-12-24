---
title: "如何郵寄遠端主機的電影清單"
date: 2020-01-10T17:04:55+08:00
draft: false
tags: ["python", "smtplib"]
---

有時幫家人載影片卻又不知道電腦裡是否已經存在，這時就可以想一個辦法自動把影片庫已經有的影片名稱定期寄Email給自己參考。

## 1. 首先，必須把Gmail低安全設定打開
1. 進到[帳號設定](https://myaccount.google.com/)
2. 左側清單中點選 `Security`.
3. 底部的低安全性限制點選 `Turn on access`.

這樣就可以透過smtp.gmail.com api來發送Email了。

## 2. 把影片名稱統一加入文字檔

{{< highlight python>}}
from pathlib import WindowsPath
from os.path import basename
from glob import glob

# 影片路徑
source = str(WindowsPath.home() / 'Videos' / 'Movies' / '*')
# 資料夾名稱list
queue = glob(source)

with open('movie_list.txt', 'w', encoding="utf-8") as f:
    for idx, m in enumerate(map(basename, queue)):
        f.write(f"{idx+1} {m}\n")

{{< / highlight >}}

## 3. 把清單文字檔用Email寄出

{{< highlight python>}}
import smtplib
import ssl
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

subject = "Movie List"
body = "This is an email with attachment sent from Python"
sender_email = "你的Email帳號"
receiver_email = "收件Email帳號"
password = "你的Email密碼"  # 也可以改成input("your password") 以便安全

# Create a multipart message and set headers
message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = subject
message["Bcc"] = receiver_email  # Recommended for mass emails

# Add body to email
message.attach(MIMEText(body, "plain"))

filename = "movie_list.txt"  # In same directory as script

# Open file in binary mode
with open(filename, "rb") as attachment:
    # Add file as application/octet-stream
    # Email client can usually download this automatically as attachment
    part = MIMEBase("application", "octet-stream")
    part.set_payload(attachment.read())

# Encode file in ASCII characters to send by email
encoders.encode_base64(part)

# Add header as key/value pair to attachment part
part.add_header(
    "Content-Disposition",
    f"attachment; filename= {filename}",
)

# Add attachment to message and convert message to string
message.attach(part)
text = message.as_string()

# Log in to server using secure context and send email
context = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, text)
{{< / highlight >}}

接著只要將Script排入作業系統的schedler就大功告成了。