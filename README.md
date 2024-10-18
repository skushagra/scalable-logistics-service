# Atlan Internship Assignment

According to the problem statement document we have the following main parts which will be independent microservices.

## Booking Service

This service will handle user bookinng related activities.

```tsx
type Location = {
	latitude: number,
	longitude: number
};

type VehicleType = "Truck" | "Tempo" | "Jeep" | "Auto"

type BookingStatus = "en Route to Pickup" |
												"Collecting Goods" |
												"Goods Collected" |
												"en Route to Delivery" |
												"Delivered"

type Booking = {
	pickupLocation: Location,
	dropLocation: Location,
	typeOfVehicle: VehicleType,
	estimatedCost: number
	assignedDriver: DriverID,
	pickupTime: DateTime
	dropOfTime: DateTime
	status: BookingStatus
}
```

booking detials

Endpoints

`GET /api/v0/book/<booking_id>` : Gets booking by booking ID.

`POST /api/v0/book` : Create a booking with payload

```tsx
{
	"userID": UserID,
	"booking": Booking
}
```

---

## Search Service

Search service will work on a read only database copy of the orignal database and will prioritise fast reads for querying data. This server will also calculate the extimated prices based on input paramerters.

The searches will have the following paramerters

```tsx
{
 "pickupLocation": Location,
 "dropLocation": Location,
 "vehicleType": VehicleType
 "searchRadius": number,
}
```

I will use the Google Distance Matrix API to effectively compute accurate distance between the `pickup` and and `drop` locations. We need simple HTTP calls for this and will therefore not store these deatils in out DB.

### Cost Finding Algorithm

To effectively calculate the cost for the booking will depend on the following factors

1. Distance and duration from `pickup` to `drop` 
2. Type of vehicle offered
3. Distance to pickup
4. Current demand

However a base price can only be calculated based on the first three and Current Demand shall only we used to determine the price elasticity of the product.

For the purpose of this assignment I will use the algorithm given below to calculate the price of a booking

```python
def getTotalBasePrice(distance: float, duration: float, baseMultiplier: int) -> float:
	speed = distance/duration
	return speed*baseMultiplier

def checkSurge(pickup: Location, totalPrice: float) -> float:
	# checks surge at this pickup
	
	surgePrice = totalPrice
	
	return surgePrice
	

def calculatePrice(pickup: Location, drop: Location, vehicle: VehicleType) -> float:
    # Using Google Distance Matrix to get the distance and duration
    distance, duration = getDistanceDuration(pickup, drop, vehicle)
    
    # I will just calculate the speed and take base price as INR 100 per unit speed.
    totalPrice = getTotalBasePrice(distance, duration, 100)
    
    # Surge price calculation
    totalPrice = checkSurge(pickup, totalPrice)
    
    return totalPrice
```

### How is Surge Pricing Calculated

Currently I have skipped the part of implementing surge pricing it is a part of the project that would possibly require some big choices in `Data Structure and Algorithm`

### Optimizing Frequent Search Queries

Given the nature of the application it does not feel relavent to use caching. We need to implement some data structure like QuadTree(used by Uber) to optimize search queries.

---

## Real Time Location Service

I will create a service to manage real time data. This service will listen on requests to puts these events into a queue which will be updataed across the database.

---

## Ananlytics Service

We will have an analytics service which will generate analytics data for the driver performance, bookings data and user activity.

---
