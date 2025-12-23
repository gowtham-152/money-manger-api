# money-manager-application

💰 Money Manager Application

A full-stack Money Manager Application that helps users track their income, expenses, categories, and financial summary in a clean and user-friendly dashboard.

🔐 Authentication

User Register & Login

Secure authentication using JWT

Protected routes after login


<img width="1797" height="911" alt="image" src="https://github.com/user-attachments/assets/829f3149-837a-4306-a463-70167abefc7b" />
<img width="1815" height="908" alt="image" src="https://github.com/user-attachments/assets/454b459b-802b-49d8-af44-30054d6700f9" />

 <img width="1503" height="433" alt="image" src="https://github.com/user-attachments/assets/4868cf71-85ca-4505-ad68-8cc86f2b5931" />



📊 Dashboard

Total Income

Total Expense

Net Balance (Profit / Loss)

Income vs Expense Graph (SVG / Chart)

<img width="1847" height="912" alt="image" src="https://github.com/user-attachments/assets/c608cb5d-b7e5-421a-bec0-30abb1f4d2d6" />



💵 Income Management

Add income entries

Categorize income

View income list

Filter by date & category

<img width="1897" height="903" alt="image" src="https://github.com/user-attachments/assets/2d057d3c-f7d1-42ae-b706-98683c7fd743" />


💸 Expense Management

Add expense entries

Category-based tracking

Expense filtering

Date-wise records

<img width="1846" height="908" alt="image" src="https://github.com/user-attachments/assets/74d56330-880e-4d86-b66e-02e7807f90b7" />


🗂️ Categories

Custom income & expense categories

Easy category selection



<img width="1826" height="915" alt="image" src="https://github.com/user-attachments/assets/8f4014b1-6fb0-49a2-920d-d106a9a2f6b1" />


<img width="1798" height="918" alt="image" src="https://github.com/user-attachments/assets/dfca6824-36ae-48c8-a45c-8d4b3ab903a0" />



👤 Profile

View & update user profile

Change password (optional)



🏗️ Tech Stack
Frontend

React + TypeScript

Tailwind CSS / CSS

Axios

Lucide React Icons

Vite

Backend

Java Spring Boot

REST APIs

JWT Authentication

MySQL / PostgreSQL

Tools

Docker

Git & GitHub



Postman

🔗 API Endpoints

Base URL:

http://localhost:8080/api/v1.0

Authentication

Method	Endpoint	Description

POST	/register	User registration

POST	/login	User login

Income
Method	Endpoint	Description

GET	/incomes	Get all incomes

POST	/incomes	Add income

DELETE	/incomes/{id}	Delete income

Expense

Method	Endpoint	Description

GET	/expenses	Get all expenses

POST	/expenses	Add expense

DELETE	/expenses/{id}	Delete expense

Categories

Method	Endpoint	Description

GET	/categories	Get categories

POST	/categories	Add category



🔐 Login API Example
Request
POST /login

{

  "username" : "Gowtham"
  
  "email": "gowtham@example.com",
  
  "password": "password123"
  
}

Response
{

  "token": "jwt-token",
  
  "username": "Gowtham"
  
}

And Activation Link should be through for send mail (workgowtham12@gmail.com)

⚙️ Frontend Setup

npm install

npm run dev


Frontend runs at:

http://localhost:5173

⚙️ Backend Setup

mvn clean install

java -jar target/app.jar


Backend runs at:

http://localhost:8080



🐳 Docker (Optional)

docker build -t moneymanager-backend .

docker run -p 8080:8080 moneymanager-backend




<img width="1792" height="907" alt="image" src="https://github.com/user-attachments/assets/e4c8eb6f-ad66-46df-9d13-d3c6ab3af7a7" />




🚀 Future Enhancements

Monthly reports

Export to Excel / PDF

Dark mode

Notifications

Budget planning
