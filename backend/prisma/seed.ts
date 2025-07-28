/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'itsbrian2025@gmail.com' },
    update: {},
    create: {
      email: 'itsbrian2025@gmail.com',
      name: 'Admin User',
      password: adminPassword,
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });

  // // Create regular users
  // const user1Password = await bcrypt.hash('user123', 10);
  // const user1 = await prisma.user.upsert({
  //   where: { email: 'john@example.com' },
  //   update: {},
  //   create: {
  //     email: 'john@example.com',
  //     name: 'John Doe',
  //     password: user1Password,
  //     phone: '+1234567891',
  //     role: 'USER',
  //   },
  // });

  // const user2Password = await bcrypt.hash('user123', 10);
  // const user2 = await prisma.user.upsert({
  //   where: { email: 'jane@example.com' },
  //   update: {},
  //   create: {
  //     email: 'jane@example.com',
  //     name: 'Jane Smith',
  //     password: user2Password,
  //     phone: '+1234567892',
  //     role: 'USER',
  //   },
  // });

  // Create courier
  // const courierPassword = await bcrypt.hash('courier123', 10);
  // const courier = await prisma.user.upsert({
  //   where: { email: 'claudebrilliant@gmail.com' },
  //   update: {},
  //   create: {
  //     email: 'claudebrilliant@gmail.com',
  //     name: 'Mike Courier',
  //     password: courierPassword,
  //     phone: '+1234567893',
  //     role: 'COURIER',
  //   },
  // });

  // // Create parcels
  // const parcel1 = await prisma.parcel.create({
  //   data: {
  //     senderId: user1.id,
  //     receiverId: user2.id,
  //     courierId: courier.id,
  //     status: 'IN_TRANSIT',
  //     pickupLocation: '123 Main St, New York, NY',
  //     destination: '456 Oak Ave, Los Angeles, CA',
  //     pricing: 45.99,
  //     trackingNumber: 'TRK001234567',
  //     estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  //     currentLat: 40.7128,
  //     currentLng: -74.0060,
  //   },
  // });

  // const parcel2 = await prisma.parcel.create({
  //   data: {
  //     senderId: user2.id,
  //     receiverId: user1.id,
  //     status: 'PENDING',
  //     pickupLocation: '789 Pine St, Chicago, IL',
  //     destination: '321 Elm St, Miami, FL',
  //     pricing: 32.50,
  //     trackingNumber: 'TRK001234568',
  //     estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  //   },
  // });

  // const parcel3 = await prisma.parcel.create({
  //   data: {
  //     senderId: user1.id,
  //     receiverId: user2.id,
  //     courierId: courier.id,
  //     status: 'DELIVERED',
  //     pickupLocation: '555 Broadway, San Francisco, CA',
  //     destination: '777 Sunset Blvd, Las Vegas, NV',
  //     pricing: 28.75,
  //     trackingNumber: 'TRK001234569',
  //     estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  //   },
  // });

  // // Create tracking steps for parcel1
  // await prisma.parcelTrackingStep.createMany({
  //   data: [
  //     {
  //       parcelId: parcel1.id,
  //       status: 'Parcel picked up',
  //       location: '123 Main St, New York, NY',
  //       lat: 40.7128,
  //       lng: -74.0060,
  //       timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //     },
  //     {
  //       parcelId: parcel1.id,
  //       status: 'In transit',
  //       location: 'Distribution Center, Philadelphia, PA',
  //       lat: 39.9526,
  //       lng: -75.1652,
  //       timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //     },
  //     {
  //       parcelId: parcel1.id,
  //       status: 'Out for delivery',
  //       location: '456 Oak Ave, Los Angeles, CA',
  //       lat: 34.0522,
  //       lng: -118.2437,
  //       timestamp: new Date(),
  //     },
  //   ],
  // });

  // // Create tracking steps for parcel3 (delivered)
  // await prisma.parcelTrackingStep.createMany({
  //   data: [
  //     {
  //       parcelId: parcel3.id,
  //       status: 'Parcel picked up',
  //       location: '555 Broadway, San Francisco, CA',
  //       lat: 37.7749,
  //       lng: -122.4194,
  //       timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //     },
  //     {
  //       parcelId: parcel3.id,
  //       status: 'In transit',
  //       location: 'Distribution Center, Sacramento, CA',
  //       lat: 38.5816,
  //       lng: -121.4944,
  //       timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //     },
  //     {
  //       parcelId: parcel3.id,
  //       status: 'Out for delivery',
  //       location: '777 Sunset Blvd, Las Vegas, NV',
  //       lat: 36.1699,
  //       lng: -115.1398,
  //       timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //     },
  //     {
  //       parcelId: parcel3.id,
  //       status: 'Delivered',
  //       location: '777 Sunset Blvd, Las Vegas, NV',
  //       lat: 36.1699,
  //       lng: -115.1398,
  //       timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //     },
  //   ],
  // });

  // // Create some notifications
  // await prisma.notification.createMany({
  //   data: [
  //     {
  //       userId: user1.id,
  //       type: 'PARCEL_CREATED',
  //       title: 'Parcel Created',
  //       message: 'Your parcel TRK001234567 has been created successfully.',
  //       parcelId: parcel1.id,
  //     },
  //     {
  //       userId: user1.id,
  //       type: 'STATUS_UPDATE',
  //       title: 'Parcel Status Update',
  //       message: 'Your parcel TRK001234567 is now in transit.',
  //       parcelId: parcel1.id,
  //     },
  //     {
  //       userId: user2.id,
  //       type: 'PARCEL_CREATED',
  //       title: 'Parcel Created',
  //       message: 'Your parcel TRK001234568 has been created successfully.',
  //       parcelId: parcel2.id,
  //     },
  //   ],
  // });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${await prisma.user.count()} users`);
  // console.log(`   - ${await prisma.parcel.count()} parcels`);
  // console.log(`   - ${await prisma.parcelTrackingStep.count()} tracking steps`);
  // console.log(`   - ${await prisma.notification.count()} notifications`);

  // console.log('\n🔑 Login Credentials:');
  // console.log('Admin: itsbrian2025@gmail.com / admin123');
  // console.log('User 1: john@example.com / user123');
  // console.log('User 2: jane@example.com / user123');
  console.log('Courier: claudebrilliant@gmail.com / courier123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
