const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@vermaandco.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@vermaandco.com');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@vermaandco.com',
        password: hashedPassword,
        phone: '9999999999',
        city: 'Chandigarh',
        role: 'admin',
        isBlocked: false
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@vermaandco.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', admin.name);
    console.log('📱 Phone:', admin.phone);
    console.log('🏙️ City:', admin.city);
    console.log('🔐 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdmin(); 