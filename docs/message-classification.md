# Message Classification Documentation

## Overview

The message classification component of the Spam Shield application is responsible for analyzing incoming messages and determining their likelihood of being spam. This is achieved through various algorithms and scoring mechanisms that evaluate the content of the messages.

## Features

- **Spam Scoring**: The system assigns a spam score to each message based on its content and other relevant factors.
- **Classification Algorithms**: Utilizes different algorithms to classify messages, including keyword analysis, machine learning models, and heuristic methods.
- **Logging and Monitoring**: Tracks the classification results for auditing and improvement purposes.

## API Endpoints

### POST /api/messages/classify

- **Description**: Classifies a message and returns its spam score.
- **Request Body**:
  - `text`: The content of the message to be classified.
  - `metadata`: Optional key-value pairs for additional context (e.g., sender information).
- **Response**:
  - `score`: The calculated spam score.
  - `classification`: The classification result (e.g., "spam", "ham").

### GET /api/messages/stats

- **Description**: Retrieves statistics about message classifications.
- **Response**:
  - `totalMessages`: Total number of messages processed.
  - `spamCount`: Number of messages classified as spam.
  - `hamCount`: Number of messages classified as ham.

## Usage

To use the message classification feature, send a POST request to the `/api/messages/classify` endpoint with the message content. The system will return a spam score and classification result.

## Classification Workflow

The message classification process follows a structured workflow to ensure accurate and consistent spam detection.

1.  **Message Reception**: The API receives a message, typically from a website contact form.
2.  **Sanitization**: The message content is sanitized to remove any potentially harmful code or markup.
3.  **Classifier Processing**: The sanitized message is passed through a series of classifiers, each designed to detect specific spam characteristics.
4.  **Scoring**: Each classifier assigns a score to the message based on its analysis.
5.  **Score Aggregation**: The scores from all classifiers are summed to produce a total score.
6.  **Classification**: If the total score is 2.9 or greater, the message is classified as spam. Otherwise, it is classified as ham.

## Future Enhancements

- Integration of machine learning models for improved accuracy.
- User feedback mechanism to refine classification algorithms.
- Support for batch processing of messages for efficiency.

## Conclusion

The message classification component is a critical part of the Spam Shield application, providing essential functionality for identifying and managing spam messages effectively.
