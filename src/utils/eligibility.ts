import { Step1Answers, Step2Answers, EligibilityResult, LawMode } from '../types';

export function calculateEligibility(
  step1: Step1Answers,
  step2: Step2Answers
): EligibilityResult {
  const isPrimary = step1.isMainResidence === 'yes';
  const isSecond = step1.isMainResidence === 'no';
  const isEntity = step2.ownershipType === 'entity';
  const isPersonal = step2.ownershipType === 'personal';
  const isHoa = step2.isCondoOrHoa === 'yes';
  const hoaAllows = step2.hoaAllowsStr === 'yes';
  const hoaDenies = step2.hoaAllowsStr === 'no';
  const hoaUnsure = step2.hoaAllowsStr === 'not_sure';
  const isProposedBill = step2.lawMode === 'proposed_2026';

  // 1. Check corporate/entity ownership (Disqualifying under BOTH laws)
  if (isEntity) {
    return {
      status: 'red',
      headline: 'Ineligible: Corporate or Trust Ownership',
      reason:
        'DC law strictly mandates that the host must be an individual natural person. The Department of Licensing and Consumer Protection (DLCP) rejects applications from LLCs, corporations, or trusts.',
      bulletPoints: [
        'Host must be an individual person (DLCP license requirement)',
        'LLC / business entity ownership is prohibited for DC short-term rentals',
        'Solution: Transferring title to personal ownership is required to apply'
      ],
      billDifference: isProposedBill
        ? 'No change: Even under the proposed 2026 bill, corporate/LLC ownership remains strictly barred.'
        : null,
      isStatusChangedByBill: false
    };
  }

  // 2. Check HOA / Condo prohibition (Private covenants trump city license)
  if (isHoa && hoaDenies) {
    return {
      status: 'red',
      headline: 'Ineligible: Condo / HOA Rules Prohibit Short-Term Rentals',
      reason:
        'Your condominium or HOA bylaws explicitly ban short-term rentals. In Washington, DC, private association covenants take precedence over city permits, and DC DLCP requires written HOA approval before issuing a license.',
      bulletPoints: [
        'Private HOA bylaws legally override District permits',
        'DLCP requires written sign-off from condo board/HOA management',
        'Operating risks steep building fines, legal injunctions, and immediate license revocation'
      ],
      billDifference: isProposedBill
        ? 'No change: The proposed 2026 bill cannot override private HOA or condominium covenants.'
        : null,
      isStatusChangedByBill: false
    };
  }

  // 3. Check Primary Residence (Crucial distinction between Current Law and Proposed 2026 Bill!)
  if (isSecond) {
    if (!isProposedBill) {
      // Under Current DC Law -> RED
      return {
        status: 'red',
        headline: 'Ineligible Under Current Law: Not Your Primary Residence',
        reason:
          "Under current Washington, DC law (Act 22-559), short-term rentals are restricted exclusively to the homeowner's primary residence (where you reside at least 183 days a year). Because this is a second or inherited property, you cannot legally obtain a DC Short-Term Rental license or Vacation Rental endorsement.",
        bulletPoints: [
          'Current DC law restricts Airbnb hosting strictly to primary residences (≥183 days/yr)',
          'Second homes, vacation properties, and inherited units are barred from STR licensing',
          'Alternative option: Medium-term furnished leases (30+ days) are legal and require no STR license',
          'Notice: Check the "Proposed 2026 bill" toggle above to see pending DC Council reform!'
        ],
        billDifference:
          'Under the proposed 2026 bill, this property could become ELIGIBLE! The bill proposes allowing DC homeowners to license one second property they own.',
        isStatusChangedByBill: true
      };
    } else {
      // Under Proposed 2026 Bill -> Could be AMBER or GREEN!
      if (isHoa && hoaUnsure) {
        return {
          status: 'amber',
          headline: 'Eligible Under 2026 Bill — Pending HOA Written Approval',
          reason:
            'Under the proposed 2026 DC bill, local residents could license one second home they own! However, because your property is in a condo/HOA, you will need verified written approval from your condo board or HOA management.',
          bulletPoints: [
            'Proposed 2026 bill allows DC residents to license one non-primary second home',
            'Pending requirement: Written authorization from your condo/HOA board is mandatory',
            'License fee remains $99 for 2 years once bill is enacted'
          ],
          billDifference:
            'STATUS CHANGED: Upgraded from RED to AMBER under the proposed 2026 bill (pending HOA clearance)!',
          isStatusChangedByBill: true
        };
      }

      return {
        status: 'green',
        headline: 'Eligible Under Proposed 2026 Bill (Pending Enactment)',
        reason:
          'Under the proposed 2026 DC Short-Term Rental Modernization Amendment, DC homeowners would be permitted to license one secondary property they own personally! If this legislation passes, your home will qualify for a DC Short-Term Rental license.',
        bulletPoints: [
          'Proposed bill grants DC residents the right to license one second property',
          'Home is personally owned (meets individual requirement)',
          'No HOA restrictions identified',
          'Standard $99 for 2-year DLCP registration expected'
        ],
        billDifference:
          'STATUS CHANGED: Upgraded from RED to GREEN! The proposed 2026 bill lifts the strict primary residence restriction for one second home.',
        isStatusChangedByBill: true
      };
    }
  }

  // 4. Check HOA Unsure (when primary residence and personally owned)
  if (isHoa && hoaUnsure) {
    return {
      status: 'amber',
      headline: 'Conditional: Written Condo / HOA Approval Required',
      reason:
        'You meet the District’s personal ownership and primary residence rules, but DC law requires written authorization from your condo board or HOA management before the DLCP will issue a license.',
      bulletPoints: [
        'DLCP requires an official written sign-off letter from your HOA/condo board',
        'Review your association bylaws for rental caps or minimum lease lengths (often 30 days)',
        'Check for association move-in/move-out fees or registration rules'
      ],
      billDifference: isProposedBill
        ? 'No change: Condo/HOA approval remains mandatory regardless of legislative updates.'
        : null,
      isStatusChangedByBill: false
    };
  }

  // 5. All criteria met! -> GREEN
  return {
    status: 'green',
    headline: 'Fully Eligible for DC Short-Term Rental License',
    reason:
      'Your property checks every core requirement under Washington, DC rules! You are eligible to apply for a DC Basic Business License with a Short-Term Rental endorsement from the Department of Licensing and Consumer Protection (DLCP).',
    bulletPoints: [
      'License fee is $99 for 2 years (issued by DC DLCP)',
      'Owned by you personally (individual host requirement met)',
      'Primary residence verified (allows unlimited hosted nights)',
      'Vacation Rental endorsement allows up to 90 unhosted nights/year while you are away',
      isHoa ? 'Condo/HOA rules permit short-term rentals (written letter required for DLCP)' : 'No condo/HOA restrictions'
    ],
    billDifference: isProposedBill
      ? 'Primary residences remain fully eligible under both current law and the 2026 bill.'
      : null,
    isStatusChangedByBill: false
  };
}
