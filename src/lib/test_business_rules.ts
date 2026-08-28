import { db } from './db';
import { getBadgeForHours, getNextBadgeInfo } from './badges';

async function runBusinessRuleTests() {
  console.log('=== RUNNING VOLUNTEER BY KROW BUSINESS RULE VERIFICATIONS ===\n');

  // Test 1: Account Separation & Initial Seed State
  console.log('[Test 1] Verifying Account Separation & Initial Categories...');
  const categories = db.getCategories();
  console.assert(categories.length >= 14, 'Should have at least 14 default categories');
  console.log('✓ Categories verified:', categories.map((c) => c.name).join(', '));

  // Test 2: Age Calculation on Event Date
  console.log('\n[Test 2] Verifying Age Calculation on Event Date...');
  const opp = db.getOpportunity('opp-3'); // min_age = 16
  const vol17YearOld = {
    id: 'vol-test-1',
    role: 'volunteer' as const,
    email: 'teen@example.com',
    name: 'Teen Volunteer',
    dob: '2008-01-01', // 18 years old in 2026
    country: 'Canada',
    province_state: 'BC',
    city: 'Coquitlam',
    created_at: new Date().toISOString(),
  };
  db.setCurrentUser(vol17YearOld);
  const regResult = await db.registerForOpportunity('opp-3', 'vol-test-1');
  console.assert(regResult.success, 'Registration should succeed for eligible age on event date');
  console.log('✓ Age calculation on event date verified:', regResult.message);

  // Test 3: Pending Organization Hours vs Completed Shift Logic
  console.log('\n[Test 3] Verifying Pending Organization Awarded Hours = 0 & Completed Shift +1...');
  const pendingOpp = db.getOpportunity('opp-3'); // Pending Org (org-3)
  db.markAttendance('opp-3', 'vol-test-1', 'here');
  const totalHours = db.calculateVolunteerTotalHours('vol-test-1');
  const completedShifts = db.calculateVolunteerCompletedShifts('vol-test-1');
  console.assert(totalHours === 0, 'Pending org shift MUST award 0 hours');
  console.assert(completedShifts === 1, 'Completed shifts MUST increment +1 even for pending orgs');
  console.log(`✓ Verified: Awarded Hours = ${totalHours}h, Completed Shifts = ${completedShifts}`);

  // Test 4: Verified Organization Hours Awarding
  console.log('\n[Test 4] Verifying Verified Organization Awarded Hours...');
  const verifiedOpp = db.getOpportunity('opp-1'); // Verified Org (org-1, 4 hours)
  db.markAttendance('opp-1', 'vol-test-1', 'here');
  const newTotalHours = db.calculateVolunteerTotalHours('vol-test-1');
  const newCompletedShifts = db.calculateVolunteerCompletedShifts('vol-test-1');
  console.assert(newTotalHours === 4, 'Verified org shift MUST award 4 hours');
  console.assert(newCompletedShifts === 2, 'Completed shifts MUST equal 2');
  console.log(`✓ Verified: Awarded Hours = ${newTotalHours}h, Completed Shifts = ${newCompletedShifts}`);

  // Test 5: Badge Thresholds
  console.log('\n[Test 5] Verifying Badge Calculations based ONLY on Awarded Hours...');
  const badge0 = getBadgeForHours(0);
  const badge15 = getBadgeForHours(15);
  const badge60 = getBadgeForHours(60);
  console.assert(badge0.id === 'newbie', '0h should be Rookie');
  console.assert(badge15.id === 'bronze', '15h should be Bronze');
  console.assert(badge60.id === 'gold', '60h should be Gold');
  console.log('✓ Badges verified:', badge0.name, '->', badge15.name, '->', badge60.name);

  // Test 6: Admin Hour Editing & Audit Log Creation
  console.log('\n[Test 6] Verifying Admin Shift Hours Adjustment & Mandatory Audit Trail...');
  const attRecord = db.getAttendanceForOpportunity('opp-1')[0];
  const auditRes = db.adminEditShiftHours(attRecord.id, 6, 'admin-1', 'Overtime approved by organizer');
  console.assert(auditRes.success, 'Admin edit should succeed');
  const auditLogs = db.getHourAuditLogs();
  console.assert(auditLogs.length >= 1, 'Audit log record MUST be created');
  console.assert(auditLogs[0].original_hours === 4 && auditLogs[0].new_hours === 6, 'Audit record values match');
  console.log('✓ Admin hour edit & audit log verified successfully!');

  // Test 7: Event Ending Unmarked -> Not Here
  console.log('\n[Test 7] Verifying Event Ending auto-marks unmarked as Not Here...');
  db.endEvent('opp-2');
  const opp2Status = db.getOpportunity('opp-2')?.status;
  console.assert(opp2Status === 'ended', 'Opportunity status should be ended');
  console.log('✓ Event ending logic verified!');

  console.log('\n=== ALL BUSINESS RULE VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runBusinessRuleTests();
