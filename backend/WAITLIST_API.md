# Waitlist API Documentation

## Overview
Simple waitlist collection API with two main endpoints for managing email subscriptions.

## Base URL
`/api/v1/waitlist`

## Endpoints

### 1. Add Email to Waitlist
**POST** `/api/v1/waitlist/subscribe`

Adds an email address to the waitlist with proper error handling.

#### Request Body
```json
{
  "email": "user@example.com",
  "source": "waitlist"  // optional, defaults to "waitlist"
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "email": "user@example.com"
}
```

#### Email Already Exists Response (201 Created)
```json
{
  "success": false,
  "message": "Email already exists",
  "email": null
}
```

#### Error Response (201 Created)
```json
{
  "success": false,
  "message": "An error occurred: <error details>",
  "email": null
}
```

**Note:** This endpoint always returns 201 status code but uses the `success` field to indicate whether the email was added or already exists.

---

### 2. Get Waitlist Count
**GET** `/api/v1/waitlist/count`

Returns the total count of active emails registered in the waitlist.

#### Success Response (200 OK)
```json
{
  "count": 42
}
```

## Error Handling

The API handles the following scenarios:
- ✅ **New email**: Returns success with the email address
- ✅ **Duplicate email**: Returns success=false with "Email already exists" message
- ✅ **Database errors**: Returns success=false with error details
- ✅ **Invalid email format**: Handled by Pydantic validation (422 error)

## Example Usage

### cURL Examples

**Add email to waitlist:**
```bash
curl -X POST "http://localhost:8000/api/v1/waitlist/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Get waitlist count:**
```bash
curl -X GET "http://localhost:8000/api/v1/waitlist/count"
```

### JavaScript/Fetch Examples

**Add email to waitlist:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/waitlist/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Email added:', data.email);
} else {
  console.log('Error:', data.message);
}
```

**Get waitlist count:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/waitlist/count');
const data = await response.json();
console.log('Total subscribers:', data.count);
```

## Features

- ✅ Email validation (must be valid email format)
- ✅ Duplicate detection (emails stored in lowercase)
- ✅ Error handling with descriptive messages
- ✅ Race condition protection
- ✅ Clean response format
- ✅ Active subscription filtering (only counts active emails)
