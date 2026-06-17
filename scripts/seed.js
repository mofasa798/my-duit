/**
 * scripts/seed.js
 *
 * Seed the database with mock transactions for portfolio demonstration.
 * Run with: npm run db:seed
 */

const { db, allAsync, runAsync } = require('../config/database');

const mockTransactions = [
  {
    desc: 'Gaji Bulanan',
    amountRange: [5000000, 8000000],
    type: 'income',
    categoryName: 'Salary',
  },
  {
    desc: 'Bonus Proyek',
    amountRange: [1000000, 3000000],
    type: 'income',
    categoryName: 'Others',
  },
  {
    desc: 'Dividen Saham',
    amountRange: [200000, 500000],
    type: 'income',
    categoryName: 'Investment',
  },
  {
    desc: 'Makan Siang',
    amountRange: [20000, 50000],
    type: 'expense',
    categoryName: 'Food',
  },
  {
    desc: 'Makan Malam',
    amountRange: [30000, 100000],
    type: 'expense',
    categoryName: 'Food',
  },
  {
    desc: 'Belanja Mingguan',
    amountRange: [200000, 500000],
    type: 'expense',
    categoryName: 'Shopping',
  },
  {
    desc: 'Isi Bensin',
    amountRange: [20000, 100000],
    type: 'expense',
    categoryName: 'Transport',
  },
  {
    desc: 'Ongkos KRL/MRT',
    amountRange: [10000, 20000],
    type: 'expense',
    categoryName: 'Transport',
  },
  {
    desc: 'Beli Kopi',
    amountRange: [15000, 40000],
    type: 'expense',
    categoryName: 'Food',
  },
  {
    desc: 'Langganan Streaming',
    amountRange: [50000, 150000],
    type: 'expense',
    categoryName: 'Others',
  },
];

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDateInPastMonth = () => {
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime =
    pastMonth.getTime() + Math.random() * (now.getTime() - pastMonth.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

const seed = async () => {
  try {
    console.log('🌱 Starting mock data seeding...');

    // Fetch categories
    const categories = await allAsync('SELECT id, name, type FROM categories');
    if (categories.length === 0) {
      console.error(
        '❌ No categories found. Please initialize the database first.'
      );
      process.exit(1);
    }

    // Generate 15 random transactions
    let inserted = 0;
    for (let i = 0; i < 15; i++) {
      const template =
        mockTransactions[Math.floor(Math.random() * mockTransactions.length)];
      const category =
        categories.find(
          (c) => c.name === template.categoryName && c.type === template.type
        ) || categories.find((c) => c.type === template.type);

      if (!category) continue;

      const amount = getRandomInt(
        template.amountRange[0],
        template.amountRange[1]
      );
      const date = getRandomDateInPastMonth();

      await runAsync(
        'INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
        [category.id, amount, template.desc, date]
      );
      inserted++;
    }

    console.log(`✅ Successfully seeded ${inserted} mock transactions.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

// Wait a moment for DB connection to initialize fully if needed, though it's usually fast enough
setTimeout(seed, 500);
