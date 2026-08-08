// analyze-project.js
// CRM Project Analyzer - Run this in your project root folder
// Command: node analyze-project.js

const fs = require('fs');
const path = require('path');

const report = {
  timestamp: new Date().toISOString(),
  projectInfo: {},
  dependencies: {},
  devDependencies: {},
  folderStructure: {},
  configFiles: {},
  environmentVariables: [],
  detectedFeatures: {},
  backendInfo: {},
  databaseInfo: {},
  authenticationInfo: {},
  routingInfo: {},
  stateManagement: {},
  stylingInfo: {},
  buildTool: {},
  recommendations: []
};

// ============ 1. Package.json Analysis ============
function analyzePackageJson() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      
      report.projectInfo = {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        scripts: pkg.scripts,
        main: pkg.main,
        type: pkg.type
      };
      
      report.dependencies = pkg.dependencies || {};
      report.devDependencies = pkg.devDependencies || {};
      
      // Detect React version
      if (pkg.dependencies?.react) {
        report.detectedFeatures.react = pkg.dependencies.react;
      }
      
      // Detect build tool
      if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
        report.buildTool.name = 'Vite';
        report.buildTool.version = pkg.dependencies?.vite || pkg.devDependencies?.vite;
      } else if (pkg.dependencies?.['react-scripts']) {
        report.buildTool.name = 'Create React App';
      } else if (pkg.dependencies?.next) {
        report.buildTool.name = 'Next.js';
        report.buildTool.version = pkg.dependencies.next;
      }
      
      // Detect routing
      if (pkg.dependencies?.['react-router-dom']) {
        report.routingInfo.library = 'React Router';
        report.routingInfo.version = pkg.dependencies['react-router-dom'];
      } else if (pkg.dependencies?.next) {
        report.routingInfo.library = 'Next.js Routing';
      }
      
      // Detect state management
      const stateLibs = ['redux', '@reduxjs/toolkit', 'zustand', 'jotai', 'recoil', 'mobx'];
      stateLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.stateManagement[lib] = pkg.dependencies[lib];
        }
      });
      
      // Detect styling
      const stylingLibs = ['tailwindcss', 'styled-components', '@emotion/react', 'sass', '@mui/material', 'antd', 'bootstrap', '@chakra-ui/react'];
      stylingLibs.forEach(lib => {
        if (pkg.dependencies?.[lib] || pkg.devDependencies?.[lib]) {
          report.stylingInfo[lib] = pkg.dependencies?.[lib] || pkg.devDependencies?.[lib];
        }
      });
      
      // Detect backend
      const backendLibs = ['express', 'fastify', 'koa', 'nest', '@nestjs/core'];
      backendLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.backendInfo[lib] = pkg.dependencies[lib];
        }
      });
      
      // Detect database
      const dbLibs = ['mongoose', 'sequelize', 'prisma', '@prisma/client', 'mysql2', 'pg', 'sqlite3', 'firebase', '@supabase/supabase-js'];
      dbLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.databaseInfo[lib] = pkg.dependencies[lib];
        }
      });
      
      // Detect authentication
      const authLibs = ['jsonwebtoken', 'passport', 'firebase', 'next-auth', '@auth0/auth0-react', 'bcrypt', 'bcryptjs'];
      authLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.authenticationInfo[lib] = pkg.dependencies[lib];
        }
      });
      
      // Detect HTTP client
      if (pkg.dependencies?.axios) report.detectedFeatures.httpClient = 'axios';
      if (pkg.dependencies?.['@tanstack/react-query']) report.detectedFeatures.dataFetching = 'React Query';
      if (pkg.dependencies?.swr) report.detectedFeatures.dataFetching = 'SWR';
      
      // Detect form libraries
      if (pkg.dependencies?.['react-hook-form']) report.detectedFeatures.forms = 'React Hook Form';
      if (pkg.dependencies?.formik) report.detectedFeatures.forms = 'Formik';
      
      // Detect UI/Icons
      const iconLibs = ['lucide-react', 'react-icons', '@heroicons/react'];
      iconLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.detectedFeatures.icons = lib;
        }
      });
     
      // Detect existing editor libraries
      const editorLibs = ['@tiptap/react', 'quill', 'draft-js', 'slate', 'lexical', '@editorjs/editorjs'];
      editorLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.detectedFeatures.existingEditor = lib;
        }
      });
      // Detect drag-drop libraries
      const dndLibs = ['@dnd-kit/core', 'react-dnd', 'react-beautiful-dnd', '@craftjs/core'];
      dndLibs.forEach(lib => {
        if (pkg.dependencies?.[lib]) {
          report.detectedFeatures.existingDragDrop = lib;
        }
      });
    }
  } catch (err) {
    report.errors = report.errors || [];
    report.errors.push('Package.json error: ' + err.message);
  }
}

// ============ 2. Folder Structure Analysis ============
function analyzeFolderStructure(dir = process.cwd(), depth = 0, maxDepth = 4) {
  if (depth > maxDepth) return null;
  
  const ignore = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'];
  const structure = {};
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      if (ignore.includes(item) || item.startsWith('.')) return;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subStructure = analyzeFolderStructure(fullPath, depth + 1, maxDepth);
        if (subStructure && Object.keys(subStructure).length > 0) {
          structure[item + '/'] = subStructure;
        } else {
          structure[item + '/'] = '(empty or deep)';
        }
      } else {
        // Only track important files
        const importantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.md', '.config.js'];
        if (importantExtensions.some(ext => item.endsWith(ext))) {
          structure[item] = `${(stat.size / 1024).toFixed(2)} KB`;
        }
      }
    });
  } catch (err) {
    // Skip inaccessible folders
  }
  
  return structure;
}

// ============ 3. Config Files Detection ============
function analyzeConfigFiles() {
  const configFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'vite.config.js',
    'vite.config.ts',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'tsconfig.json',
    'jsconfig.json',
    '.eslintrc.js',
    '.eslintrc.json',
    '.prettierrc',
    'babel.config.js',
    '.babelrc',
    'webpack.config.js',
    'craco.config.js'
  ];
  
  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      report.configFiles[file] = 'exists';
      
      // Extract env variable names (not values for security)
      if (file.startsWith('.env')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const envVars = content
            .split('\n')
            .filter(line => line.trim() && !line.trim().startsWith('#'))
            .map(line => line.split('=')[0].trim())
            .filter(Boolean);
          report.environmentVariables = [...new Set([...report.environmentVariables, ...envVars])];
        } catch (err) {}
      }
    }
  });
}

// ============ 4. Source Code Analysis ============
function analyzeSourceCode() {
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) return;
  
  const stats = {
    totalFiles: 0,
    components: 0,
    pages: 0,
    hooks: 0,
    contexts: 0,
    services: 0,
    utils: 0,
    apiCalls: [],
    routes: []
  };
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
          stats.totalFiles++;
          
          const relativePath = path.relative(srcPath, fullPath).toLowerCase();
          
          if (relativePath.includes('component')) stats.components++;
          if (relativePath.includes('page')) stats.pages++;
          if (relativePath.includes('hook') || item.startsWith('use')) stats.hooks++;
          if (relativePath.includes('context')) stats.contexts++;
          if (relativePath.includes('service') || relativePath.includes('api')) stats.services++;
          if (relativePath.includes('util') || relativePath.includes('helper')) stats.utils++;
          
          // Read file content for API detection
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Detect API endpoints
            const apiMatches = content.match(/['"`]\/api\/[^'"`\s]+['"`]/g);
            if (apiMatches) {
              apiMatches.forEach(match => {
                const cleaned = match.replace(/['"`]/g, '');
                if (!stats.apiCalls.includes(cleaned)) {
                  stats.apiCalls.push(cleaned);
                }
              });
            }
            
            // Detect routes
            const routeMatches = content.match(/path=['"`][^'"`]+['"`]/g);
            if (routeMatches) {
              routeMatches.forEach(match => {
                const route = match.replace(/path=['"`]|['"`]/g, '');
                if (!stats.routes.includes(route)) {
                  stats.routes.push(route);
                }
              });
            }
          } catch (err) {}
        }
      });
    } catch (err) {}
  }
  
  scanDirectory(srcPath);
  report.sourceCodeStats = stats;
}

// ============ 5. Check for Backend Folder ============
function checkBackend() {
  const possibleBackendFolders = ['backend', 'server', 'api', 'services'];
  const found = [];
  
  possibleBackendFolders.forEach(folder => {
    const folderPath = path.join(process.cwd(), folder);
    if (fs.existsSync(folderPath)) {
      const pkgPath = path.join(folderPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          found.push({
            folder,
            dependencies: pkg.dependencies || {},
            scripts: pkg.scripts || {}
          });
        } catch (err) {}
      } else {
        found.push({ folder, note: 'Folder exists but no package.json' });
      }
    }
  });
  
  if (found.length > 0) {
    report.backendFolders = found;
  }
}

// ============ 6. Generate Recommendations ============
function generateRecommendations() {
  const recs = [];
  
  if (!report.dependencies['@tiptap/react'] && !report.detectedFeatures.existingEditor) {
    recs.push('Install TipTap for rich text editing: npm install @tiptap/react @tiptap/starter-kit');
  }
  
  if (!report.detectedFeatures.existingDragDrop) {
    recs.push('Install @dnd-kit/core for drag-and-drop builder: npm install @dnd-kit/core @dnd-kit/sortable');
  }
  
  if (!report.dependencies.dompurify) {
    recs.push('Install DOMPurify for HTML sanitization: npm install dompurify');
  }
  
  if (!report.dependencies['react-hook-form']) {
    recs.push('Install React Hook Form: npm install react-hook-form');
  }
  
  if (!report.stylingInfo.tailwindcss) {
    recs.push('Consider Tailwind CSS + Typography plugin for auto styling');
  }
  
  report.recommendations = recs;
}

// ============ Run Analysis ============
console.log('🔍 Analyzing your CRM project...\n');

analyzePackageJson();
console.log('✅ Package.json analyzed');

report.folderStructure = analyzeFolderStructure();
console.log('✅ Folder structure analyzed');

analyzeConfigFiles();
console.log('✅ Config files analyzed');

analyzeSourceCode();
console.log('✅ Source code analyzed');

checkBackend();
console.log('✅ Backend checked');

generateRecommendations();
console.log('✅ Recommendations generated');

// ============ Save Report ============
const reportPath = path.join(process.cwd(), 'project-analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Also create a readable summary
const summaryPath = path.join(process.cwd(), 'project-analysis-summary.txt');
let summary = '═══════════════════════════════════════════════════\n';
summary += '   CRM PROJECT ANALYSIS REPORT\n';
summary += '═══════════════════════════════════════════════════\n\n';
summary += `Generated: ${report.timestamp}\n\n`;

summary += '📦 PROJECT INFO\n';
summary += '─────────────────\n';
summary += `Name: ${report.projectInfo.name}\n`;
summary += `Version: ${report.projectInfo.version}\n\n`;

summary += '🛠️ BUILD TOOL\n';
summary += '─────────────────\n';
summary += `${report.buildTool.name || 'Not detected'} ${report.buildTool.version || ''}\n\n`;

summary += '⚛️ REACT VERSION\n';
summary += '─────────────────\n';
summary += `${report.detectedFeatures.react || 'Not detected'}\n\n`;

summary += '🎨 STYLING\n';
summary += '─────────────────\n';
Object.keys(report.stylingInfo).forEach(lib => {
  summary += `${lib}: ${report.stylingInfo[lib]}\n`;
});
summary += '\n';

summary += '🗄️ BACKEND\n';
summary += '─────────────────\n';
if (Object.keys(report.backendInfo).length > 0) {
  Object.keys(report.backendInfo).forEach(lib => {
    summary += `${lib}: ${report.backendInfo[lib]}\n`;
  });
} else {
  summary += 'No backend detected in main package.json\n';
}
if (report.backendFolders) {
  summary += `\nBackend folders found: ${report.backendFolders.map(b => b.folder).join(', ')}\n`;
}
summary += '\n';

summary += '💾 DATABASE\n';
summary += '─────────────────\n';
if (Object.keys(report.databaseInfo).length > 0) {
  Object.keys(report.databaseInfo).forEach(lib => {
    summary += `${lib}: ${report.databaseInfo[lib]}\n`;
  });
} else {
  summary += 'No database library detected\n';
}
summary += '\n';

summary += '🔐 AUTHENTICATION\n';
summary += '─────────────────\n';
if (Object.keys(report.authenticationInfo).length > 0) {
  Object.keys(report.authenticationInfo).forEach(lib => {
    summary += `${lib}: ${report.authenticationInfo[lib]}\n`;
  });
} else {
  summary += 'No auth library detected\n';
}
summary += '\n';

summary += '🧭 ROUTING\n';
summary += '─────────────────\n';
summary += `${report.routingInfo.library || 'Not detected'} ${report.routingInfo.version || ''}\n\n`;

summary += '📊 STATE MANAGEMENT\n';
summary += '─────────────────\n';
if (Object.keys(report.stateManagement).length > 0) {
  Object.keys(report.stateManagement).forEach(lib => {
    summary += `${lib}: ${report.stateManagement[lib]}\n`;
  });
} else {
  summary += 'Using React built-in state (useState/Context)\n';
}
summary += '\n';

summary += '📁 SOURCE CODE STATS\n';
summary += '─────────────────\n';
if (report.sourceCodeStats) {
  summary += `Total files: ${report.sourceCodeStats.totalFiles}\n`;
  summary += `Components: ${report.sourceCodeStats.components}\n`;
  summary += `Pages: ${report.sourceCodeStats.pages}\n`;
  summary += `Hooks: ${report.sourceCodeStats.hooks}\n`;
  summary += `Services/APIs: ${report.sourceCodeStats.services}\n`;
  summary += `Utils: ${report.sourceCodeStats.utils}\n\n`;
  
  summary += `Detected API endpoints (${report.sourceCodeStats.apiCalls.length}):\n`;
  report.sourceCodeStats.apiCalls.slice(0, 20).forEach(api => {
    summary += `  - ${api}\n`;
  });
  summary += '\n';
  
  summary += `Detected routes (${report.sourceCodeStats.routes.length}):\n`;
  report.sourceCodeStats.routes.slice(0, 20).forEach(route => {
    summary += `  - ${route}\n`;
  });
}
summary += '\n';

summary += '🔧 CONFIG FILES\n';
summary += '─────────────────\n';
Object.keys(report.configFiles).forEach(file => {
  summary += `✓ ${file}\n`;
});
summary += '\n';

summary += '🌍 ENVIRONMENT VARIABLES (names only)\n';
summary += '─────────────────\n';
report.environmentVariables.forEach(v => {
  summary += `${v}\n`;
});
summary += '\n';

summary += '💡 RECOMMENDATIONS\n';
summary += '─────────────────\n';
report.recommendations.forEach(rec => {
  summary += `• ${rec}\n`;
});

fs.writeFileSync(summaryPath, summary);

console.log('\n═══════════════════════════════════════════════════');
console.log('✅ ANALYSIS COMPLETE!');
console.log('═══════════════════════════════════════════════════');
console.log(`\n📄 Full report: ${reportPath}`);
console.log(`📄 Summary: ${summaryPath}`);
console.log('\n👉 Please share both files with your developer.\n');
