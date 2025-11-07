# IP Address Reputation Documentation

## Overview

The IP Address Reputation component of the Spam Shield application is responsible for assessing the reputation of IP addresses based on various criteria. This functionality is crucial for identifying potentially malicious sources and enhancing the overall spam detection capabilities of the application.

## Features

- **Reputation Scoring**: Each IP address is assigned a reputation score based on historical data and activity patterns.
- **Data Sources**: The reputation data can be sourced from various blocklists and threat intelligence feeds.
- **API Integration**: The component provides a RESTful API for querying IP reputation scores and related information.

## API Endpoints

### Get IP Reputation

- **Endpoint**: `/api/reputation/:ip`
- **Method**: `GET`
- **Description**: Retrieves the reputation score and details for a specific IP address.
- **Parameters**:
  - `ip`: The IP address to query.
- **Response**:
  - `200 OK`: Returns the reputation score and details.
  - `404 Not Found`: If the IP address is not found in the database.

### Update IP Reputation

- **Endpoint**: `/api/reputation/:ip`
- **Method**: `PUT`
- **Description**: Updates the reputation score for a specific IP address.
- **Parameters**:
  - `ip`: The IP address to update.
- **Request Body**:
  - `score`: The new reputation score.
  - `reason`: The reason for the score update.
- **Response**:
  - `200 OK`: Successfully updated the reputation score.
  - `400 Bad Request`: If the request body is invalid.

## Data Model

The IP Address Reputation data model includes the following fields:

- `ip`: The IP address.
- `score`: The reputation score (e.g., from 0 to 100).
- `lastChecked`: Timestamp of the last reputation check.
- `source`: The source of the reputation data (e.g., blocklist name).

## Usage

To utilize the IP Address Reputation functionality, integrate the provided API endpoints into your application. Ensure that the necessary data sources are configured and that the database is populated with relevant IP reputation data.

## Conclusion

The IP Address Reputation component is a vital part of the Spam Shield application, providing essential data for spam detection and prevention. By leveraging this functionality, users can enhance their ability to identify and mitigate spam threats effectively.
