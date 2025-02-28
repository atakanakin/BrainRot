import datetime
import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

WELCOME_MAIL = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BrainRot!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px;
        }

        .content {
            padding: 20px;
        }

        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666;
        }

        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        a {
            color: #4CAF50;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to BrainRot!</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We’re thrilled to have you as part of the <strong>BrainRot</strong> community! 🎉 Our mission is to give
                your creativity the space it deserves. To help you get started, we’ve added <strong>20 extra create
                    tokens</strong> to your account as a welcome gift. They’ll be available by the end of the day!</p>
            <p>If you’re enjoying your experience with BrainRot, remember: this entire platform is backed by just one
                person — me! 😊 If you’d like to support my work and help me keep BrainRot running, you can do so here:
            </p>
            <p><a class="button" href="https://buymeacoffee.com/atakanakin" target="_blank">Buy Me a Coffee</a></p>
            <p>Thank you for joining, and I can’t wait to see where your creativity takes you.</p>
            <p>Happy creating!</p>
            <p>Cheers,</p>
            <p><strong>Atakan Akın</strong><br>Founder of BrainRot</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 BrainRot. All rights reserved.</p>
            <p>Visit us at <a href="https://thebrainrot.fun">thebrainrot.fun</a></p>
        </div>
    </div>
</body>

</html>
"""

LOW_TOKEN_MAIL = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Token Alert - BrainRot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #FF5722;
            color: white;
            text-align: center;
            padding: 20px;
        }

        .content {
            padding: 20px;
        }

        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666;
        }

        .button {
            display: inline-block;
            background-color: #FF5722;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        a {
            color: #FF5722;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>You're Running Low on Tokens!</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We noticed that your token balance is running low. Tokens are essential for creating videos and sharing
                your ideas on <strong>BrainRot</strong>. Did you know that <strong>1 token equals 100 words worth of
                    video
                    production</strong>? Make sure you never run out and keep your creative momentum going!</p>
            <p><strong>Special Offer: For a limited time, you can get 30 tokens for just $5 — that’s 50% off the usual
                    price of $10!</strong>
                This exclusive offer is designed to help you keep creating without worrying about running out of tokens.
            </p>
            <p>For advertising, we’ve also made things more affordable: just <strong>$5 per 30 tokens</strong>. It’s our
                way of supporting your growth and creativity.</p>
            <p><a class="button" href="https://buymeacoffee.com/atakanakin/e/360249" target="_blank">Buy 30 Tokens for
                    $5</a></p>
            <p>Don’t miss out on this special offer. Grab it now and continue creating with BrainRot!</p>
            <p>Happy creating!</p>
            <p>Cheers,</p>
            <p><strong>Atakan Akın</strong><br>Founder of BrainRot</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 BrainRot. All rights reserved.</p>
            <p>Visit us at <a href="https://thebrainrot.fun">thebrainrot.fun</a></p>
        </div>
    </div>
</body>

</html>
"""


def get_utc3_time():
    return datetime.datetime.now(
        datetime.timezone(datetime.timedelta(hours=3))
    ).strftime("%Y-%m-%d %H:%M:%S")


def log_error(error_file, error_message):
    with open(error_file, "a") as file:
        file.write(error_message + "\n")


def send_telegram_message(bot_token, chat_id, message):
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage?chat_id={chat_id}&text={message}"
        response = requests.get(url)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False


def welcome_new_user(sendgrid_api_key, bot_token, chat_id, user_mail, user_name):
    message = Mail(
        from_email="hello@thebrainrot.fun",
        to_emails=user_mail,
        subject="Welcome to BrainRot",
        html_content=WELCOME_MAIL,
    )
    is_sent = False
    try:
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)
        if response.status_code == 202:
            is_sent = True
        else:
            print(response.status_code)
            print("Failed to send email to " + user_mail)
            print(response.body)
            print("\n\n")
    except Exception as e:
        print("Failed to send email to " + user_mail)
        print(f"Error: {e}")
        print("\n\n")

    send_telegram_message(
        bot_token,
        chat_id,
        f"BrainRot: New user 🎉: {user_name} ({user_mail}). Mail Status: {is_sent}",
    )


def low_token_alert(sendgrid_api_key, bot_token, chat_id, user_mail, user_name):
    message = Mail(
        from_email="no-reply@thebrainrot.fun",
        to_emails=user_mail,
        subject="Low Token Alert - BrainRot",
        html_content=LOW_TOKEN_MAIL,
    )
    is_sent = False
    try:
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)
        if response.status_code == 202:
            is_sent = True
        else:
            print(response.status_code)
            print("Failed to send email to " + user_mail)
            print(response.body)
            print("\n\n")
    except Exception as e:
        print("Failed to send email to " + user_mail)
        print(f"Error: {e}")
        print("\n\n")

    send_telegram_message(
        bot_token,
        chat_id,
        f"BrainRot: Low token alert 🚨: {user_name} ({user_mail}). Mail Status: {is_sent}",
    )


def unexpected_error(bot_token, chat_id, error_file, raw_error):
    try:
        error_message = f"{get_utc3_time()} {raw_error}"
        log_error(error_file, f"{error_message}\n\n")
        send_telegram_message(bot_token, chat_id, error_message)
    except Exception as e:
        print(f"Error in unexpected_error: {e}")
