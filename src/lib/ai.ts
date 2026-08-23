import type { Profile, Campaign } from '@/lib/supabase';

export type MatchResult = {
  score: number;
  reasons: string[];
};

export function calculateMatchScore(volunteer: Partial<Profile>, campaign: Campaign): MatchResult {
  const reasons: string[] = [];
  let score = 30;

  const vSkills = volunteer.skills ?? [];
  const vInterests = volunteer.interests ?? [];
  const vLanguages = volunteer.languages ?? [];
  const vLocation = (volunteer.location ?? '').toLowerCase();
  const vAvailability = (volunteer.availability ?? '').toLowerCase();

  const cSkills = campaign.required_skills ?? [];
  const cLanguages = campaign.languages ?? [];
  const cLocation = campaign.location.toLowerCase();
  const cCategory = campaign.category;

  // Skills match (max 30 points)
  const matchedSkills = cSkills.filter(s => vSkills.some(vs => vs.toLowerCase() === s.toLowerCase()));
  if (matchedSkills.length > 0) {
    score += Math.min(30, matchedSkills.length * 15);
    reasons.push(`You have ${matchedSkills.join(', ')} skill${matchedSkills.length > 1 ? 's' : ''} matching the campaign requirements`);
  }

  // Interest / category match (max 15 points)
  const categoryMatch = vInterests.some(
    i => i.toLowerCase().includes(cCategory) || cCategory.includes(i.toLowerCase())
  );
  if (categoryMatch) {
    score += 15;
    reasons.push(`Your interests align with the campaign's ${cCategory.replace('_', ' ')} focus`);
  }

  // Location match (max 10 points)
  if (vLocation && cLocation) {
    if (vLocation === cLocation || vLocation.includes(cLocation) || cLocation.includes(vLocation)) {
      score += 10;
      reasons.push(`The campaign is in ${campaign.location}, matching your location`);
    } else if (vLocation.split(',')[0] === cLocation.split(',')[0]) {
      score += 5;
    }
  }

  // Language match (max 8 points)
  const matchedLangs = cLanguages.filter(l => vLanguages.some(vl => vl.toLowerCase() === l.toLowerCase()));
  if (matchedLangs.length > 0) {
    score += 8;
    reasons.push(`You speak ${matchedLangs.join(', ')}, needed for this campaign`);
  }

  // Availability bonus (max 7 points)
  if (vAvailability && vAvailability !== '') {
    score += 7;
    reasons.push('Your availability fits the campaign schedule');
  }

  score = Math.min(score, 99);

  if (reasons.length === 0) {
    reasons.push('This campaign may be a good opportunity to expand your skills and impact');
  }

  return { score, reasons };
}

export function getMatchColor(score: number): { color: string; label: string } {
  if (score >= 85) return { color: 'text-secondary-600', label: 'Excellent Match' };
  if (score >= 70) return { color: 'text-primary-600', label: 'Strong Match' };
  if (score >= 55) return { color: 'text-accent-600', label: 'Good Match' };
  return { color: 'text-gray-500', label: 'Possible Match' };
}

export type GeneratedCampaign = {
  title: string;
  description: string;
  required_skills: string[];
  volunteer_requirements: string;
  suggested_timeline: string;
  task_breakdown: string[];
  expected_impact: string;
};

export function generateCampaignPlan(input: {
  goal: string;
  location: string;
  targetCommunity: string;
  requiredVolunteers: number;
  skills: string[];
  duration: string;
}): GeneratedCampaign {
  const { goal, location, targetCommunity, skills, duration } = input;
  const goalLower = goal.toLowerCase();

  let titleSuffix = 'Initiative';
  let categoryFocus = 'community';
  if (goalLower.includes('education') || goalLower.includes('teach') || goalLower.includes('school')) {
    titleSuffix = 'Education Drive';
    categoryFocus = 'education';
  } else if (goalLower.includes('health') || goalLower.includes('medical') || goalLower.includes('care')) {
    titleSuffix = 'Health Outreach';
    categoryFocus = 'healthcare';
  } else if (goalLower.includes('environment') || goalLower.includes('tree') || goalLower.includes('clean')) {
    titleSuffix = 'Environmental Action';
    categoryFocus = 'environment';
  } else if (goalLower.includes('food') || goalLower.includes('hunger')) {
    titleSuffix = 'Food Security Program';
    categoryFocus = 'food security';
  } else if (goalLower.includes('women') || goalLower.includes('empower')) {
    titleSuffix = 'Empowerment Program';
    categoryFocus = 'women empowerment';
  } else if (goalLower.includes('digital') || goalLower.includes('computer') || goalLower.includes('technology')) {
    titleSuffix = 'Digital Literacy Drive';
    categoryFocus = 'digital literacy';
  } else if (goalLower.includes('rural') || goalLower.includes('village')) {
    titleSuffix = 'Rural Development Initiative';
    categoryFocus = 'rural development';
  } else if (goalLower.includes('disaster') || goalLower.includes('relief') || goalLower.includes('emergency')) {
    titleSuffix = 'Relief Operation';
    categoryFocus = 'disaster relief';
  }

  const title = `${targetCommunity} ${titleSuffix} — ${location}`;
  const description = `This ${categoryFocus} campaign aims to ${goal.toLowerCase()} for the ${targetCommunity} community in ${location}. Over the course of ${duration}, volunteers will work directly with community members to deliver sustainable, measurable impact. The program combines hands-on service with capacity building to ensure long-term benefits beyond the campaign period.`;

  const taskBreakdown = [
    `Week 1: Community assessment and needs mapping in ${location}`,
    `Week 2: Volunteer orientation and ${skills.slice(0, 2).join(' and ') || 'skill'} training sessions`,
    `Weeks 3-5: Core campaign activities — delivering ${categoryFocus} services to ${targetCommunity}`,
    `Week 6: Impact measurement, community feedback collection, and reporting`,
  ];

  const expectedImpact = `Approximately ${Math.max(50, input.requiredVolunteers * 20)} people from the ${targetCommunity} community will benefit directly. The campaign will build local capacity in ${categoryFocus}, create ${input.requiredVolunteers} trained volunteers, and establish a sustainable support network in ${location}.`;

  return {
    title,
    description,
    required_skills: skills.length > 0 ? skills : ['Communication', 'Teamwork', 'Organizing'],
    volunteer_requirements: `We need ${input.requiredVolunteers} dedicated volunteers with skills in ${skills.join(', ') || 'communication and community engagement'}. Volunteers should be available for ${duration} and willing to work directly with the ${targetCommunity} community.`,
    suggested_timeline: `Campaign duration: ${duration}. Recommended start: within 2 weeks of publishing. Includes 1 week preparation, core activity period, and 1 week impact assessment.`,
    task_breakdown: taskBreakdown,
    expected_impact: expectedImpact,
  };
}

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function generateAssistantResponse(
  message: string,
  context: { role: string; profileName: string; profileRole: string }
): string {
  const msg = message.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello ${context.profileName}! I'm your SocialSphere AI Assistant. I can help you discover campaigns, understand your impact score, plan campaigns, or find community needs. What would you like to explore today?`;
  }

  if (msg.includes('find') || msg.includes('campaign') || msg.includes('opportunity')) {
    if (context.profileRole === 'volunteer') {
      return `I can help you find the right campaigns! Based on your profile, I recommend checking the Discover page where campaigns are ranked by your personal match score. Look for campaigns with 85%+ match scores — those align closely with your skills and interests. You can also filter by category, location, and time commitment. Would you like tips on what makes a strong application?`;
    }
    return `For organizations, I recommend using the AI Campaign Planner to create compelling campaigns. You provide the goal, location, and target community, and I'll generate a complete campaign plan with task breakdown and expected impact. Would you like to start planning a campaign?`;
  }

  if (msg.includes('impact') && msg.includes('score')) {
    return `Your Impact Score is calculated from several factors: campaigns completed (each adds ~100 points), volunteer hours logged, people impacted through your campaigns, skills contributed, and certificates earned. As your score grows, you unlock achievement levels: Bronze (0-200), Silver (200-500), Gold (500-800), Platinum (800-1200), and Diamond (1200+). Check your profile for the full breakdown and progress visualization.`;
  }

  if (msg.includes('create') && (msg.includes('campaign') || msg.includes('initiative'))) {
    return `Great! To create a campaign, navigate to "Create Campaign" and use the AI Campaign Planner. Just describe your goal (e.g., "Teach digital skills to rural women"), specify the location and target community, and I'll generate a professional campaign plan including title, description, required skills, task breakdown, and expected impact. You can edit everything before publishing. Would you like to start now?`;
  }

  if (msg.includes('certificate')) {
    return `Certificates are automatically issued when an organization marks your campaign participation as completed. Each certificate includes your name, campaign details, hours contributed, and people impacted. You can view and download all your certificates from your profile page under the Certificates section.`;
  }

  if (msg.includes('emergency') || msg.includes('disaster') || msg.includes('crisis')) {
    return `The Emergency Response module allows authorized organizations to publish urgent community needs — floods, cyclones, fires, medical emergencies, and more. Active emergencies appear prominently on the dashboard and emergency page. As a volunteer, you can quickly join emergency response campaigns. The system prioritizes matching volunteers with nearby skills-matching opportunities during crises.`;
  }

  if (msg.includes('community need') || msg.includes('intelligence')) {
    return `Community Need Intelligence analyzes and displays high-priority needs across categories like education, healthcare, environment, and disaster relief. Each need shows location, people affected, priority level, and suggested actions. You can browse needs to find areas where your organization can create the most impact, or where you as a volunteer can contribute meaningfully.`;
  }

  if (msg.includes('match') || msg.includes('matching') || msg.includes('ai match')) {
    return `Our AI matching system analyzes your skills, interests, location, languages, and availability against campaign requirements. Each campaign shows a personalized match score (0-99%) with an explanation of why it's a good fit. Scores above 85% mean excellent alignment. The more complete your profile, the more accurate your matches — so make sure to fill in your skills, interests, and location!`;
  }

  if (msg.includes('how') && (msg.includes('work') || msg.includes('use'))) {
    return `SocialSphere connects volunteers, NGOs, colleges, companies, and government organizations. As a ${context.profileRole}, you can ${context.profileRole === 'volunteer' ? 'discover campaigns, apply to participate, track your impact score, earn certificates, and join the community feed' : 'create campaigns, use AI to plan initiatives, manage volunteer applications, track attendance, and measure social impact'}. Use the sidebar navigation to explore all features. What specific area would you like help with?`;
  }

  if (msg.includes('profile')) {
    return `Your profile is your identity on SocialSphere. Make sure to complete your bio, skills, interests, languages, and location — this information powers our AI matching system. The more detailed your profile, the better your campaign matches. You can edit your profile anytime from the Profile page.`;
  }

  return `I'm here to help with anything on SocialSphere — finding campaigns, understanding your impact score, planning campaigns, community needs, emergency response, certificates, and more. Try asking me "How do I find campaigns?" or "Explain my impact score" or "Help me create a campaign".`;
}
