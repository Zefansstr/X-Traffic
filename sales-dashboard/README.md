# Sales Dashboard

Dashboard sales yang dibangun dengan Next.js, MongoDB, dan Tailwind CSS. Aplikasi ini memungkinkan Anda untuk:

- Input data sales baru
- Melihat summary dan statistik sales
- Menampilkan data sales dalam bentuk tabel
- Tracking performa sales secara real-time

## Fitur Utama

### 📊 Dashboard Summary
- Total sales count
- Closed sales count
- Pending sales count
- Total revenue (dari closed sales)
- Pending revenue
- Average sale amount
- Success rate percentage
- Cancelled sales count

### 📝 Form Input Sales
- Customer name
- Staff selection
- Department selection
- Amount/Deposit
- Agent, Traffic, Device, Game selection
- Notes (optional)

### 📋 Data Table
- Menampilkan semua data sales
- Format currency dalam MYR
- Status dengan color coding
- Sorting berdasarkan tanggal terbaru
- Filter berdasarkan department

### ⚙️ Settings Management
- Staff management (dengan soft delete)
- Agent management
- Traffic management
- Device management
- Game management
- Department management
- Exchange Rate management (dengan DELETE function)
- Commission Rate management

## Tech Stack

- **Frontend**: Next.js 15 dengan App Router
- **Database**: MongoDB Atlas dengan Mongoose
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## Installation

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup MongoDB Atlas:
   - Buat cluster MongoDB Atlas
   - Tambahkan IP address 0.0.0.0/0 untuk Vercel deployment
   - Dapatkan connection string

4. Setup environment variables:
   ```bash
   # .env.local
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Jalankan development server:
   ```bash
   npm run dev
   ```

6. Buka browser dan akses: `http://localhost:3000`

## Vercel Deployment

### Untuk mengatasi masalah deployment di Vercel:

1. **Set Environment Variables di Vercel:**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

2. **Pastikan MongoDB Atlas Network Access:**
   - Tambahkan IP address `0.0.0.0/0` untuk Vercel
   - Atau gunakan integrasi MongoDB Atlas di Vercel

3. **Build dan Deploy:**
   ```bash
   npm run build
   npm run start
   ```

4. **Test Health Check:**
   ```bash
   # Local
   curl http://localhost:3000/api/health
   
   # Production
   curl https://your-app.vercel.app/api/health
   ```

### Troubleshooting Vercel Issues:

1. **Database Connection Timeout:**
   - Periksa MONGODB_URI di environment variables
   - Pastikan MongoDB Atlas cluster aktif
   - Periksa network access rules

2. **Build Errors:**
   ```bash
   # Cek dan fix ESLint errors
   npm run lint
   
   # Cek TypeScript errors
   npx tsc --noEmit
   ```

3. **Performance Issues:**
   - Gunakan connection pooling (sudah dikonfigurasi)
   - Timeout dioptimalkan untuk serverless
   - Heartbeat frequency disesuaikan

## API Endpoints

### GET /api/health
Health check untuk database connection

### Sales API
- `GET /api/sales` - Mengambil semua sales
- `POST /api/sales` - Membuat sales baru
- `PUT /api/sales/[id]` - Update sales
- `DELETE /api/sales/[id]` - Hapus sales

### Staff API
- `GET /api/staff` - Mengambil semua staff (active)
- `POST /api/staff` - Membuat staff baru
- `PUT /api/staff/[id]` - Update staff
- `DELETE /api/staff/[id]` - Soft delete staff

### Other Management APIs
- `/api/departments` - CRUD departments
- `/api/agents` - CRUD agents
- `/api/traffic` - CRUD traffic
- `/api/devices` - CRUD devices
- `/api/games` - CRUD games
- `/api/exchange-rates` - CRUD exchange rates (termasuk DELETE)
- `/api/commission-rates` - CRUD commission rates

## Database Schema

### Sales Collection
```typescript
{
  customerName: String (required),
  deposit: Number (required),
  staffId: ObjectId (required),
  agentId: ObjectId (required),
  trafficId: ObjectId (optional),
  deviceId: ObjectId (optional),
  gameId: ObjectId (optional),
  department: String (required),
  exchangeRate: Number (default: 1),
  amount: Number,
  amountInMYR: Number,
  currency: String (default: 'MYR'),
  type: String,
  status: String (enum: ['pending', 'closed', 'cancelled']),
  date: Date (default: Date.now),
  notes: String,
  isDepositor: Boolean (default: false),
  isFDA: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Staff Collection
```typescript
{
  name: String (required),
  position: String (required, enum: ['SE1', 'SE2', 'PE1', 'PE2', 'Manager']),
  email: String,
  phone: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Exchange Rate Collection
```typescript
{
  fromCurrency: String (required, enum: ['USD', 'IDR', 'MYR']),
  toCurrency: String (required, enum: ['USD', 'IDR', 'MYR']),
  rate: Number (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Development

Untuk development, pastikan:
1. MongoDB Atlas cluster sudah running
2. Environment variables sudah di-set
3. Network access sudah dikonfigurasi
4. Jalankan `npm run dev` untuk development server

## Production Deployment

1. Build aplikasi: `npm run build`
2. Start production server: `npm start`
3. Pastikan MongoDB connection string sudah benar untuk production
4. Set environment variables di Vercel dashboard

## Masalah yang Sudah Diperbaiki

1. ✅ **Department filter** - Menggunakan departmentList
2. ✅ **New customer form** - Debugging logs ditambahkan
3. ✅ **Staff Target field** - Sudah dihapus dari model
4. ✅ **Staff deletion** - Menggunakan soft delete
5. ✅ **Exchange rate DELETE** - Fungsi DELETE sudah ditambahkan
6. ✅ **Database connection** - Timeout dioptimalkan untuk Vercel
7. ✅ **Build errors** - TypeScript dan ESLint errors diperbaiki
8. ✅ **Form structure** - Urutan form diubah sesuai kebutuhan
9. ✅ **Username/Password** - Dihapus karena tidak diperlukan

## Contributing

Silakan buat pull request untuk improvement atau bug fixes.

## License

MIT License
