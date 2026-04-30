import mongoose from 'mongoose';

const names = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Krishna","Ishaan","Shaurya",
  "Atharv","Dhruv","Kabir","Rudra","Ayaan","Yash","Aryan","Ansh","Parth","Rohan",
  "Rahul","Kunal","Nikhil","Siddharth","Manav","Dev","Harsh","Tanish","Laksh","Om",
  "Shiv","Varun","Ayush","Rajat","Kartik","Mohit","Deepak","Amit","Sumit","Ankit",
  "Vikas","Ravi","Gaurav","Pankaj","Sandeep","Nitin","Tarun","Ujjwal","Yogesh","Zaid",
  "Faizan","Imran","Armaan","Sameer","Salman","Asif","Irfan","Naveed","Adil","Wasim",
  "Aakash","Abhishek","Ajay","Alok","Amar","Anand","Ashish","Atul","Bharat","Chirag",
  "Danish","Dinesh","Farhan","Ganesh","Gopal","Himanshu","Jatin","Jitendra","Kamal","Karan",
  "Lokesh","Madan","Manish","Mukesh","Naresh","Neeraj","Prakash","Prashant","Rakesh","Ramesh",
  "Rohit","Sachin","Sanjay","Satish","Shyam","Suraj","Suresh","Vijay","Vinay","Vivek",
  "Abhay","Adarsh","Akash","Anurag","Bhavesh","Chandan","Darshan","Eshan","Girish","Hemant",
  "Inder","Jagdish","Kishan","Mahesh","Narayan","Pradeep","Rajesh","Shankar","Uday","Vimal"
];

// MongoDB connection URI - update with your database name
const MONGO_URI = "mongodb+srv://nehalsingh9752:Nehal835@cluster0.ofvdyf5.mongodb.net/hostmyshow?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  eventsOrganized: [mongoose.Schema.Types.ObjectId],
  eventsAttended: [mongoose.Schema.Types.ObjectId],
  otp: String,
  otpExpires: mongoose.Schema.Types.Mixed,
  interests: [String],
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function insertUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = [];
    for (let i = 0; i < 130; i++) {
      const name = names[i % names.length] + (i + 1);
      users.push({
        username: name,
        email: name.toLowerCase() + "@gmail.com",
        password: "$2b$10$jatyR4cGyzMJDvBGxYwGsOteVZoZpCOX7audeNJIv548FAhLvhO86",
        role: "Attendee",
        isVerified: true,
        eventsOrganized: [],
        eventsAttended: [],
        otp: "",
        otpExpires: null,
        interests: ["music"],
        avatar: "",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await User.insertMany(users);
    console.log('✅ 130 users inserted successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error inserting users:', error);
  }
}

insertUsers();