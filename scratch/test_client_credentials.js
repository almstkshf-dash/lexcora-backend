require('dotenv').config();
const db = require('../src/config/db');
const partiesModel = require('../src/models/partiesModel');
const { comparePassword } = require('../src/utils/passwordUtils');

async function runTest() {
  console.log('=== STARTING CLIENT CREDENTIALS TEST ===');
  let testPartyId1 = null;
  let testPartyId2 = null;

  try {
    // 1. Create a party with custom username and password
    const testUsername1 = 'testclient_' + Math.floor(Math.random() * 100000);
    const testPassword1 = 'MySecurePass123!';
    
    console.log(`1. Creating client with username: ${testUsername1}`);
    testPartyId1 = await partiesModel.createParty({
      name: 'Test Client 1',
      phone: '123456789',
      party_type: 'client',
      username: testUsername1,
      password: testPassword1,
      status: 'active'
    });
    console.log(`- Created client with ID: ${testPartyId1}`);

    // Retrieve from DB and verify
    const client1 = await partiesModel.getPartyById(testPartyId1);
    console.log(`- Retrieved username from DB: ${client1.username}`);
    if (client1.username !== testUsername1) {
      throw new Error(`Username mismatch! Expected ${testUsername1}, got ${client1.username}`);
    }

    const isPasswordCorrect = await comparePassword(testPassword1, client1.password);
    console.log(`- Password comparison check (correct password): ${isPasswordCorrect}`);
    if (!isPasswordCorrect) {
      throw new Error('Password was not saved/hashed correctly!');
    }

    // 2. Test duplicate username on create
    console.log('2. Testing duplicate username on creation...');
    try {
      await partiesModel.createParty({
        name: 'Test Client 2',
        phone: '987654321',
        party_type: 'client',
        username: testUsername1, // duplicate
        password: 'anotherpassword',
        status: 'active'
      });
      throw new Error('Expected duplicate username creation to fail, but it succeeded!');
    } catch (err) {
      if (err.message === 'USERNAME_ALREADY_EXISTS') {
        console.log('- Duplicate username check passed (creation failed as expected with USERNAME_ALREADY_EXISTS)');
      } else {
        throw err;
      }
    }

    // 3. Create a second client to test update duplicate check
    const testUsername2 = 'testclient_' + Math.floor(Math.random() * 100000);
    console.log(`3. Creating second client with username: ${testUsername2}`);
    testPartyId2 = await partiesModel.createParty({
      name: 'Test Client 2',
      phone: '987654321',
      party_type: 'client',
      username: testUsername2,
      password: 'password123',
      status: 'active'
    });

    // 4. Test duplicate username on update
    console.log('4. Testing duplicate username on update...');
    try {
      await partiesModel.updateParty(testPartyId2, {
        username: testUsername1 // Try to take the first client's username
      });
      throw new Error('Expected duplicate username update to fail, but it succeeded!');
    } catch (err) {
      if (err.message === 'USERNAME_ALREADY_EXISTS') {
        console.log('- Duplicate username check passed (update failed as expected with USERNAME_ALREADY_EXISTS)');
      } else {
        throw err;
      }
    }

    // 5. Test update with masked password ('********')
    console.log('5. Testing update with masked password "********"...');
    const oldHash = client1.password;
    await partiesModel.updateParty(testPartyId1, {
      name: 'Test Client 1 Updated Name',
      password: '********'
    });

    const client1Updated = await partiesModel.getPartyById(testPartyId1);
    console.log(`- Checked if password changed: ${oldHash === client1Updated.password ? 'NO (Passed)' : 'YES (Failed)'}`);
    if (oldHash !== client1Updated.password) {
      throw new Error('Password was modified or hashed again when it was "********"!');
    }

    // 6. Test update with bcrypt hash password (like when admin sends the retrieved hash)
    console.log('6. Testing update with existing bcrypt hash password...');
    await partiesModel.updateParty(testPartyId1, {
      password: oldHash
    });

    const client1UpdatedWithHash = await partiesModel.getPartyById(testPartyId1);
    console.log(`- Checked if password changed when sending hash: ${oldHash === client1UpdatedWithHash.password ? 'NO (Passed)' : 'YES (Failed)'}`);
    if (oldHash !== client1UpdatedWithHash.password) {
      throw new Error('Password was double-hashed when sending the bcrypt hash!');
    }

    // 7. Test updating to a new password
    console.log('7. Testing updating to a new password...');
    const testPasswordNew = 'BrandNewPassword999!';
    await partiesModel.updateParty(testPartyId1, {
      password: testPasswordNew
    });

    const client1NewPass = await partiesModel.getPartyById(testPartyId1);
    const isNewPasswordCorrect = await comparePassword(testPasswordNew, client1NewPass.password);
    console.log(`- Password comparison check (new password): ${isNewPasswordCorrect}`);
    if (!isNewPasswordCorrect) {
      throw new Error('New password was not updated or hashed correctly!');
    }

    console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');

  } catch (error) {
    console.error('!!! TEST FAILED !!!');
    console.error(error);
  } finally {
    // Clean up database
    console.log('Cleaning up test data...');
    if (testPartyId1) {
      await db.query('DELETE FROM parties WHERE id = ?', [testPartyId1]);
    }
    if (testPartyId2) {
      await db.query('DELETE FROM parties WHERE id = ?', [testPartyId2]);
    }
    await db.end();
    console.log('DB Connection closed.');
  }
}

runTest();
