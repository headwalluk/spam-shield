# Spam Shield Development Notes

## App Structure

This NodeJS app consists of a stateless server app that presents a REST API and a web interface. The REST API can take JSON representations of message text & KV fields and return a spam score. It can also return IP address reputation information, and log/reset activity IP addresses activity.

THe app will be stateless so it can be safely clustered.

There will be a CLI app included, used for executing long-running tasks such as extracting IP addres blocklists and performing database housekeeping.

Local settings will be stored in ".env" in the project root. Use the "env.sample" file as a template for your own ".env" file.

## Requirements

The database will be MariaDB.

This may or may not run on MS Windows, but it will definintely work on Linux/BSD/MacOS installations.

Given this will most lielyl be deployed withing hosting providers' internal systems, we won't include any provision for SSL. If you want an SSL front-end, host Spam Shield behind a reverse proxy. Spam Shield respects X-Forwarded-FOr headers in the proper way.

## Components

- IP Address Reputation: [IP Address Reputation](./ip-address-reputation.md)
- Message Classification: [Message Classification](./message-classification.md)
- REST API: [REST API](./rest-api.md)
- Front-end Site Structure: [Front-end Site Structure](./site-structure.md)
