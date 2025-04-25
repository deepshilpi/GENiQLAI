const fs = require('fs');
const path = require('path');

const filePath = 'client/src/pages/threads-community-page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add onDelete prop to all ThreadsStylePost components that don't have it
content = content.replace(
  /(<ThreadsStylePost[\s\S]*?onSendMessage={handleSendMessage})(\s+currentUser={user})/g,
  '$1\n                            onDelete={handleDeletePost}$2'
);

fs.writeFileSync(filePath, content);
console.log('Updated all ThreadsStylePost components in the file.');
