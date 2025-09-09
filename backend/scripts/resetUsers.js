const { sequelize } = require('../config/database');
const User = require('../models/User');

async function main() {
  const action = process.argv[2] || 'unlock';
  try {
    await sequelize.authenticate();

    if (action === 'unlock') {
      const [count] = await User.update(
        { loginAttempts: 0, lockUntil: null },
        { where: {} }
      );
      console.log(`✅ Unlocked users (updated ${count} row(s))`);
    } else if (action === 'deleteAll') {
      const count = await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
      console.log(`✅ Deleted all users (removed ${count} row(s))`);
    } else if (action === 'deleteByEmail') {
      const email = process.argv[3];
      if (!email) {
        console.error('❌ Provide email: node scripts/resetUsers.js deleteByEmail user@example.com');
        process.exit(1);
      }
      const count = await User.destroy({ where: { email } });
      console.log(`✅ Deleted ${count} user(s) with email ${email}`);
    } else {
      console.log('Usage:');
      console.log('  node scripts/resetUsers.js unlock');
      console.log('  node scripts/resetUsers.js deleteAll');
      console.log('  node scripts/resetUsers.js deleteByEmail user@example.com');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
}

main();


