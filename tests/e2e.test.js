// This is a simple end-to-end test for the duplicate guess game-over path
// Run with: node tests/e2e.test.js

import fetch from 'node-fetch';
import assert from 'assert';

const API_URL = 'http://localhost:3000';

async function runTest() {
  console.log('Running end-to-end test for duplicate guess detection...');
  
  // First guess - should succeed
  const firstGuess = 'Paper';
  const firstResponse = await fetch(`${API_URL}/api/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess: firstGuess, current: 'Rock' })
  });
  
  const firstResult = await firstResponse.json();
  assert(firstResult.success, 'First guess should succeed');
  console.log('✅ First guess successful');
  
  // Second guess - should succeed
  const secondGuess = 'Scissors';
  const secondResponse = await fetch(`${API_URL}/api/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess: secondGuess, current: firstGuess })
  });
  
  const secondResult = await secondResponse.json();
  assert(secondResult.success, 'Second guess should succeed');
  console.log('✅ Second guess successful');
  
  // Duplicate guess - should cause game over
  const duplicateResponse = await fetch(`${API_URL}/api/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess: firstGuess, current: secondGuess })
  });
  
  const duplicateResult = await duplicateResponse.json();
  assert(!duplicateResult.success, 'Duplicate guess should fail');
  assert(duplicateResult.error === 'duplicate_guess', 'Should identify as duplicate guess');
  console.log('✅ Duplicate guess correctly detected');
  
  console.log('All tests passed!');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});