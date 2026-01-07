const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Generate a unique, non-guessable shareable link for a project
exports.generateShareableLink = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { projectId } = data;
    
    if (!projectId) {
      throw new functions.https.HttpsError('invalid-argument', 'Project ID is required');
    }

    // Generate a unique shareable link
    const shareableLink = generateUniqueLink();
    
    // Update the project document with the shareable link
    await db.collection('projects').doc(projectId).update({
      shareableLink: shareableLink
    });

    return { success: true, shareableLink };
  } catch (error) {
    console.error('Error generating shareable link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate shareable link');
  }
});

// Check if a user has access to a project
exports.checkAccess = functions.https.onCall(async (data, context) => {
  try {
    const { projectId, userId } = data;
    
    if (!projectId) {
      throw new functions.https.HttpsError('invalid-argument', 'Project ID is required');
    }

    // Get the project document
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found');
    }

    const projectData = projectDoc.data();
    
    // Check if user is the owner
    if (projectData.ownerId === userId) {
      return { hasAccess: true, role: 'owner' };
    }
    
    // Check if user is a collaborator
    if (projectData.collaborators && projectData.collaborators.includes(userId)) {
      return { hasAccess: true, role: 'collaborator' };
    }
    
    return { hasAccess: false, role: 'none' };
  } catch (error) {
    console.error('Error checking access:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check access');
  }
});

// Add a user as a collaborator to a project
exports.updateCollaborators = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { projectId, userId, action } = data;
    
    if (!projectId || !userId || !action) {
      throw new functions.https.HttpsError('invalid-argument', 'Project ID, user ID, and action are required');
    }

    if (!['add', 'remove'].includes(action)) {
      throw new functions.https.HttpsError('invalid-argument', 'Action must be either "add" or "remove"');
    }

    // Get the project document
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found');
    }

    const projectData = projectDoc.data();
    
    // Check if the current user is the owner
    if (projectData.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only project owners can manage collaborators');
    }

    let updatedCollaborators = projectData.collaborators || [];
    
    if (action === 'add') {
      // Add user if not already a collaborator
      if (!updatedCollaborators.includes(userId)) {
        updatedCollaborators.push(userId);
      }
    } else if (action === 'remove') {
      // Remove user from collaborators
      updatedCollaborators = updatedCollaborators.filter(id => id !== userId);
    }

    // Update the project document
    await projectRef.update({
      collaborators: updatedCollaborators
    });

    return { 
      success: true, 
      action, 
      userId, 
      collaborators: updatedCollaborators 
    };
  } catch (error) {
    console.error('Error updating collaborators:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update collaborators');
  }
});

// Function to generate a unique, non-guessable link
function generateUniqueLink() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Trigger function when a new project is created
exports.onProjectCreated = functions.firestore
  .document('projects/{projectId}')
  .onCreate(async (snap, context) => {
    try {
      const projectData = snap.data();
      
      // Generate shareable link for new projects
      if (!projectData.shareableLink) {
        const shareableLink = generateUniqueLink();
        await snap.ref.update({ shareableLink });
      }
    } catch (error) {
      console.error('Error in onProjectCreated trigger:', error);
    }
  });

// Trigger function when a project is deleted
exports.onProjectDeleted = functions.firestore
  .document('projects/{projectId}')
  .onDelete(async (snap, context) => {
    try {
      const projectId = context.params.projectId;
      
      // Clean up associated comments
      const commentsSnapshot = await db.collection('projects').doc(projectId).collection('comments').get();
      const batch = db.batch();
      
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error in onProjectDeleted trigger:', error);
    }
  });
