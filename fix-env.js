// Comprehensive environment variable fix script
const fs = require('fs');
const path = require('path');

console.log('=== ENVIRONMENT VARIABLE DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('Looking for .env.local file...');

const envPath = path.join(process.cwd(), '.env.local');
console.log('Env file path:', envPath);

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✓ .env.local file found');
    console.log('File content:');
    console.log(envContent);
    
    // Check for common issues
    const issues = [];
    
    if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
      issues.push('Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (!envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      issues.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    if (envContent.includes('your_supabase_project_url')) {
      issues.push('Using placeholder URL instead of real value');
    }
    
    if (envContent.includes('your_actual_anon_key')) {
      issues.push('Using placeholder key instead of real value');
    }
    
    // Check for encoding issues
    if (envContent.includes('\ufeff')) {
      issues.push('BOM/encoding issue detected');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(issue => console.log('  -', issue));
      
      console.log('\n🔧 FIXES NEEDED:');
      console.log('1. Replace placeholder values with real Supabase credentials');
      console.log('2. Remove any BOM/encoding characters');
      console.log('3. Ensure no extra quotes around values');
      console.log('4. Check file encoding is UTF-8');
    } else {
      console.log('\n✅ Environment file looks good!');
    }
    
  } else {
    console.log('❌ .env.local file not found!');
    console.log('Please create .env.local with your credentials');
  }
} catch (error) {
  console.error('Error reading .env.local:', error.message);
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Fix any issues found above');
console.log('2. Restart development server: npm run dev');
console.log('3. Test environment variables with: node fix-env.js');
