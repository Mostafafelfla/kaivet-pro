# Kaivet Pro - Professional Veterinary Clinic Management System

A modern, full-stack veterinary clinic management system built with React, Node.js, tRPC, and MySQL. Designed to streamline clinic operations, patient management, and medical record keeping.

## 🌟 Features

### Core Management
- **Patient Management**: Complete patient profiles with medical history, allergies, and blood type tracking
- **Appointment Scheduling**: Calendar-based appointment system with veterinarian assignment
- **Medical Cases**: Comprehensive case management with symptoms, diagnosis, treatment plans, and prognosis
- **Vaccination Tracking**: Complete vaccination records with overdue alerts and compliance reporting
- **Medical Tests**: Lab test management and results tracking
- **Prescriptions**: Medication management with dosage and frequency tracking

### Advanced Features
- **AI Medical Consultation**: Real-time veterinary consultation powered by LLM
- **Analytics Dashboard**: Revenue analysis, appointment statistics, vaccination compliance metrics
- **Inventory Management**: Medical supplies and equipment tracking with low-stock alerts
- **Supplier Management**: Vendor information and supply chain management
- **Financial Tracking**: Transaction management and revenue reporting
- **Staff Management**: Veterinarian profiles and specialization tracking

### User Experience
- **Professional Dashboard**: Overview of clinic operations and key metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Role-Based Access**: Admin, clinic owner, veterinarian, staff, and client roles
- **Real-Time Updates**: Live data synchronization across all pages
- **Advanced Search**: Filter and search patients, appointments, and cases

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **tRPC**: End-to-end type-safe APIs
- **Wouter**: Lightweight routing

### Backend
- **Node.js**: Server runtime
- **Express 4**: Web framework
- **tRPC 11**: Type-safe RPC framework
- **Drizzle ORM**: Type-safe database access
- **MySQL/TiDB**: Database

### Additional
- **Manus OAuth**: Authentication
- **LLM Integration**: AI consultation features
- **S3 Storage**: File storage

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm or npm
- MySQL database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/mostafafelfla/kaivet-pro.git
cd kaivet-pro
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
Create a `.env` file with:
```
DATABASE_URL=mysql://user:password@localhost:3306/kaivet_pro
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
```

4. **Setup database**
```bash
pnpm db:push
```

5. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
kaivet-pro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Backend Node.js/Express
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

## 🚀 Key Pages

- **Dashboard**: Overview of clinic operations and statistics
- **Patients**: Complete patient management with medical history
- **Appointments**: Schedule and manage veterinary appointments
- **Medical Cases**: Track patient cases with diagnosis and treatment
- **Vaccinations**: Manage vaccination records and compliance
- **AI Consultation**: Real-time veterinary consultation with AI
- **Analytics**: Revenue, appointment, and compliance reporting

## 🔐 Security

- OAuth-based authentication
- Role-based access control (RBAC)
- Type-safe database queries with Drizzle ORM
- Protected API endpoints with tRPC
- Secure file storage with S3

## 📊 Database Schema

The system includes 17 tables:
- users, clinics, veterinarians
- patients, appointments, cases
- vaccinations, medicalTests, prescriptions
- services, inventory, suppliers
- transactions, chatSessions, chatMessages
- promotions, todos

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 📧 Support

For support, email: mostafafelfla1@gmail.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video consultation integration
- [ ] Advanced reporting with PDF export
- [ ] Payment gateway integration (Stripe)
- [ ] Email and SMS notifications
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced analytics with charts

## 👨‍💻 Author

**Mostafa Shaker**
- GitHub: [@mostafafelfla](https://github.com/mostafafelfla)
- Email: mostafafelfla1@gmail.com

---

Built with ❤️ for veterinary professionals
