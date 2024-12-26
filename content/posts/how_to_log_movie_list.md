---
title: "How to mail the movie list from the remote host"
date: 2020-01-10T17:04:55+08:00
draft: false
authors: ["Morris"]
tags: ["powershell", "go", "smtplib"]
---

Sometimes I upload videos for my family but don’t know if they already exist on the computer. At this time, I can think of a way to automatically email the titles of the videos already in the video library to myself for reference on a regular basis.

{{< highlight zsh >}}
~/Downloads
➤ cat 2021-12-03-movie_list.txt -r :10
───────┬────────────────────────────────────────────────────────────────────────────────────────────────
       │ File: 2021-12-03-movie_list.txt
───────┼────────────────────────────────────────────────────────────────────────────────────────────────
   1   │ 2021-12-03 Movie List
   2   │
   3   │ CreationTime             Name
   4   │ ------------             ----
   5   │ 2021/11/13 下午 05:03:45 紅色通緝令
   6   │ 2021/11/12 下午 04:03:19 高玩殺手
   7   │ 2021/11/12 下午 04:03:17 007生死交戰
   8   │ 2021/11/12 下午 03:57:13 芬奇的旅程
   9   │ 2021/11/12 下午 03:46:12 沙丘
  10   │ 2021/9/21 下午 03:28:33  最佳销售员
───────┴────────────────────────────────────────────────────────────────────────────────────────────────
{{< / highlight >}}

## Gmail low security settings must be turned on

1. Go to [Account Settings](https://myaccount.google.com/)
2. Click `Security` in the list on the left.
3. At the bottom of the low security restriction click `Turn on access`.

In this way, emails can be sent through the `smtp.gmail.com` api.

## Consolidate video titles into text files

{{< highlight powershell>}}

    echo "Starting Mailing Task"
    cd C:\Users\user\Documents\movie_list

    # Remove all .txt file
    Get-ChildItem $Path | Where{$_.Name -Match ".*.txt"} | Remove-Item 
    
    # init file
    echo "$(get-date -f yyyy-MM-dd) Movie List" > "$(get-date -f yyyy-MM-dd)-movie_list.txt"
    
    # Movies
    Get-ChildItem 'D:\Movies' | Where-Object { $_.CreationTime.Date -lt (Get-Date).Date } | Sort CreationTime -Descending | Select-Object CreationTime,Name | Format-Table -Wrap >> "$(get-date -f yyyy-MM-dd)-movie_list.txt"
    
    # Movies Details
    tree 'D:\Movies' /F >> "$(get-date -f yyyy-MM-dd)-movie_list.txt"
    
    # TV-Series
    Get-ChildItem 'D:\TV-Series' | Where-Object { $_.CreationTime.Date -lt (Get-Date).Date } | Sort CreationTime -Descending | Select-Object CreationTime,Name | Format-Table -Wrap >> "$(get-date -f yyyy-MM-dd)-movie_list.txt"
    
    # TV-Details
    Get-ChildItem 'D:\TV-Details' -Depth 1 | Where-Object { $_.CreationTime.Date -lt (Get-Date).Date } | Sort CreationTime -Descending | Format-Table -Wrap >> "$(get-date -f yyyy-MM-dd)-movie_list.txt"
    
    # Start Email process
    Start-Process -FilePath "C:\Users\user\Documents\movie_list\send_email.exe"
    echo "Done!"

{{< / highlight >}}

## Find the latest archive listing

{{< highlight go>}}

    package main

    import (
        "crypto/tls"
        "fmt"
        "os"
        "path/filepath"

        "gopkg.in/mail.v2"
    )

    func WalkMatch(root, pattern string) ([]string, error) {
        var matches []string
        err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
            if err != nil {
                return err
            }
            if info.IsDir() {
                return nil
            }
            if matched, err := filepath.Match(pattern, filepath.Base(path)); err != nil {
                return err
            } else if matched {
                matches = append(matches, path)
            }
            return nil
        })
        if err != nil {
            return nil, err
        }
        return matches, nil
    }

{{< / highlight >}}

## Email the result list file

{{< highlight go>}}

    func main() {
        fmt.Println("Start mailing process...")
        files, err := WalkMatch("C:/Users/user/Documents/movie_list", "*.txt")
        if err != nil {
            panic(err)
        }

        m := mail.NewMessage()
        m.SetHeader("From", "destination@gmail.com")
        m.SetHeader("To", "youremail@gmail.com")
        m.SetHeader("Subject", "Movie List")
        m.Attach(files[0])

        d := mail.NewDialer("smtp.gmail.com", 587, "destination@gmail.com", "yourpassword")
        d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
        d.StartTLSPolicy = mail.MandatoryStartTLS

        if err := d.DialAndSend(m); err != nil {
            panic(err)
        }
        fmt.Println("Successfully sent list to youremail@gmail.com")
    }
{{< / highlight >}}

Finally just put the Script into the schedler of the operating system! Cheers~ :beers:
