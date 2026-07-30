import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function repair() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log('--- REPAIRING MONGODB DATA INTEGRITY ---');

  const orgs = await db.collection('organizations').find({}).toArray();
  for (let org of orgs) {
    let ws = await db.collection('workspaces').findOne({ organizationId: org._id, deletedAt: null });
    if (!ws) {
      const res = await db.collection('workspaces').insertOne({
        name: 'Default Workspace',
        organizationId: org._id,
        description: 'Auto-repaired default workspace',
        visibility: 'internal',
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      ws = { _id: res.insertedId };
      console.log('Created default workspace for org ' + org.name + ': ' + ws._id);
    } else {
      console.log('Found workspace for org ' + org.name + ': ' + ws._id);
    }

    // Repair projects with missing or org-level workspaceId
    const projResult = await db.collection('projects').updateMany(
      { organizationId: org._id, $or: [{ workspaceId: org._id }, { workspaceId: null }, { workspaceId: { $exists: false } }] },
      { $set: { workspaceId: ws._id } }
    );
    console.log('Repaired projects for org ' + org.name + ': ' + projResult.modifiedCount + ' updated');

    // Repair members with missing workspaceId
    const memResult = await db.collection('members').updateMany(
      { organizationId: org._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
      { $set: { workspaceId: ws._id } }
    );
    console.log('Repaired members for org ' + org.name + ': ' + memResult.modifiedCount + ' updated');

    // Repair tasks with missing workspaceId
    const taskResult = await db.collection('tasks').updateMany(
      { organizationId: org._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
      { $set: { workspaceId: ws._id } }
    );
    console.log('Repaired tasks for org ' + org.name + ': ' + taskResult.modifiedCount + ' updated');
  }

  console.log('--- MONGODB REPAIR COMPLETE ---');
  process.exit(0);
}

repair().catch(e => { console.error(e); process.exit(1); });
