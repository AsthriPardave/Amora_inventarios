/**
 * Script de verificación de configuración de Google Sheets
 * Ejecuta este script para verificar que todo está configurado correctamente
 */

require('dotenv').config();

const checks = {
    passed: 0,
    failed: 0,
    warnings: 0
};

console.log('\n' + '='.repeat(60));
console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN DE GOOGLE SHEETS');
console.log('='.repeat(60) + '\n');

// 1. Verificar variables de entorno
console.log('📋 Verificando variables de entorno...\n');

// GOOGLE_SHEET_ID
if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEET_ID !== 'tu_sheet_id_aqui') {
    console.log('✅ GOOGLE_SHEET_ID configurado');
    console.log(`   ID: ${process.env.GOOGLE_SHEET_ID.substring(0, 20)}...`);
    checks.passed++;
} else {
    console.log('❌ GOOGLE_SHEET_ID no configurado o usa valor de ejemplo');
    checks.failed++;
}

// GOOGLE_CLIENT_EMAIL
if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_CLIENT_EMAIL !== 'tu_client_email_aqui') {
    console.log('✅ GOOGLE_CLIENT_EMAIL configurado');
    console.log(`   Email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
    
    // Verificar formato del email
    if (process.env.GOOGLE_CLIENT_EMAIL.includes('@') && 
        process.env.GOOGLE_CLIENT_EMAIL.includes('.iam.gserviceaccount.com')) {
        console.log('   ✓ Formato correcto de cuenta de servicio');
        checks.passed++;
    } else {
        console.log('   ⚠️  El email no parece ser de una cuenta de servicio');
        checks.warnings++;
    }
} else {
    console.log('❌ GOOGLE_CLIENT_EMAIL no configurado o usa valor de ejemplo');
    checks.failed++;
}

// GOOGLE_PRIVATE_KEY
if (process.env.GOOGLE_PRIVATE_KEY) {
    if (process.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') &&
        process.env.GOOGLE_PRIVATE_KEY.includes('END PRIVATE KEY')) {
        console.log('✅ GOOGLE_PRIVATE_KEY configurado');
        console.log('   ✓ Contiene BEGIN y END PRIVATE KEY');
        
        // Verificar si está entre comillas
        const envFile = require('fs').readFileSync('.env', 'utf8');
        const privateKeyLine = envFile.split('\n').find(line => line.startsWith('GOOGLE_PRIVATE_KEY='));
        
        if (privateKeyLine && privateKeyLine.includes('"')) {
            console.log('   ✓ Está correctamente entre comillas');
        } else {
            console.log('   ⚠️  Debería estar entre comillas dobles');
            checks.warnings++;
        }
        
        checks.passed++;
    } else {
        console.log('❌ GOOGLE_PRIVATE_KEY no tiene el formato correcto');
        console.log('   Debe contener -----BEGIN PRIVATE KEY----- y -----END PRIVATE KEY-----');
        checks.failed++;
    }
} else {
    console.log('❌ GOOGLE_PRIVATE_KEY no configurado');
    checks.failed++;
}

console.log('\n' + '-'.repeat(60) + '\n');

// 2. Verificar nombres de hojas
console.log('📊 Verificando nombres de hojas...\n');

const sheets = {
    'SHEET_NAME_PRODUCTOS': process.env.SHEET_NAME_PRODUCTOS || 'Productos',
    'SHEET_NAME_VENTAS': process.env.SHEET_NAME_VENTAS || 'Ventas',
    'SHEET_NAME_INGRESOS': process.env.SHEET_NAME_INGRESOS || 'Ingresos',
    'SHEET_NAME_CAMBIOS': process.env.SHEET_NAME_CAMBIOS || 'Cambios',
    'SHEET_NAME_CATEGORIAS': process.env.SHEET_NAME_CATEGORIAS || 'Categorias',
    'SHEET_NAME_MOVIMIENTOS': process.env.SHEET_NAME_MOVIMIENTOS || 'Movimientos'
};

Object.entries(sheets).forEach(([key, value]) => {
    console.log(`✅ ${key}: "${value}"`);
});

console.log('\n⚠️  Asegúrate de que estas pestañas existan en tu Google Sheet');

console.log('\n' + '-'.repeat(60) + '\n');

// 3. Intentar conexión con Google Sheets
console.log('🔌 Intentando conectar con Google Sheets...\n');

const googleSheetsConfig = require('./src/config/googleSheets.config');

googleSheetsConfig.initialize()
    .then(() => {
        console.log('✅ ¡Conexión exitosa con Google Sheets!\n');
        checks.passed++;
        
        console.log('🎯 Intentando leer la hoja de Ventas...\n');
        
        const googleSheetsService = require('./src/services/googleSheets.service');
        return googleSheetsService.readSheet(sheets.SHEET_NAME_VENTAS, 'A1:O1');
    })
    .then((headers) => {
        if (headers && headers.length > 0) {
            console.log('✅ Hoja "Ventas" encontrada con encabezados:');
            console.log(`   ${headers[0].join(' | ')}\n`);
            checks.passed++;
        } else {
            console.log('⚠️  Hoja "Ventas" encontrada pero sin encabezados');
            console.log('   Agrega los encabezados según la guía\n');
            checks.warnings++;
        }
        
        printSummary();
        process.exit(checks.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
        console.log('❌ Error al conectar con Google Sheets:\n');
        console.log(`   ${error.message}\n`);
        
        if (error.message.includes('invalid_grant')) {
            console.log('💡 Posibles soluciones:');
            console.log('   - Verifica que GOOGLE_PRIVATE_KEY esté correctamente copiado');
            console.log('   - Asegúrate de que la clave privada esté entre comillas en .env');
            console.log('   - Revisa que no falten caracteres al copiar la clave\n');
        } else if (error.message.includes('Permission denied')) {
            console.log('💡 Posibles soluciones:');
            console.log('   - Comparte la hoja con el email de la cuenta de servicio');
            console.log('   - Dale permisos de "Editor"');
            console.log('   - Email de cuenta de servicio: ' + process.env.GOOGLE_CLIENT_EMAIL + '\n');
        } else if (error.message.includes('not found')) {
            console.log('💡 Posibles soluciones:');
            console.log('   - Verifica que GOOGLE_SHEET_ID sea correcto');
            console.log('   - Revisa que la hoja exista en tu cuenta de Google\n');
        }
        
        checks.failed++;
        printSummary();
        process.exit(1);
    });

function printSummary() {
    console.log('='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60) + '\n');
    
    console.log(`✅ Verificaciones exitosas: ${checks.passed}`);
    console.log(`⚠️  Advertencias: ${checks.warnings}`);
    console.log(`❌ Errores: ${checks.failed}\n`);
    
    if (checks.failed === 0 && checks.warnings === 0) {
        console.log('🎉 ¡Todo está configurado correctamente!');
        console.log('   Puedes iniciar el servidor con: npm run dev\n');
    } else if (checks.failed === 0) {
        console.log('⚠️  Hay algunas advertencias pero deberías poder continuar');
        console.log('   Revisa los mensajes anteriores\n');
    } else {
        console.log('❌ Hay errores en la configuración');
        console.log('   Revisa la guía GUIA_GOOGLE_SHEETS.md\n');
    }
}
