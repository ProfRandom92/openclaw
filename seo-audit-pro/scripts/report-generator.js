/**
 * Generates a comprehensive SEO audit report
 * @param {Object} auditResults - Combined audit results
 * @returns {Object} Formatted report with score and recommendations
 */
export function generateReport(auditResults) {
  const { pageSpeed, metaTags, technical, images, links } = auditResults;

  // Calculate overall score
  const score = calculateOverallScore(auditResults);

  // Collect all issues
  const criticalIssues = [];
  const warnings = [];
  const opportunities = [];

  // Process meta tag issues
  if (metaTags.issues) {
    metaTags.issues.forEach(issue => {
      criticalIssues.push(issue.message);
    });
  }
  if (metaTags.warnings) {
    metaTags.warnings.forEach(warning => {
      warnings.push(warning.message);
    });
  }
  if (metaTags.opportunities) {
    metaTags.opportunities.forEach(opp => {
      opportunities.push(opp.message);
    });
  }

  // Process header issues
  if (metaTags.headers?.issues) {
    metaTags.headers.issues.forEach(issue => {
      criticalIssues.push(issue.message);
    });
  }
  if (metaTags.headers?.warnings) {
    metaTags.headers.warnings.forEach(warning => {
      warnings.push(warning.message);
    });
  }

  // Process image issues
  if (images?.issues) {
    images.issues.forEach(issue => {
      warnings.push(issue.message);
    });
  }

  // Process technical SEO
  if (technical) {
    if (!technical.hasSSL) {
      criticalIssues.push('Site not using HTTPS (SSL certificate)');
    }
    if (!technical.hasRobotsTxt) {
      warnings.push('robots.txt not found');
    }
    if (!technical.hasSitemap) {
      warnings.push('sitemap.xml not found or not accessible');
    }
    if (technical.http2) {
      opportunities.push('Consider enabling HTTP/2 for better performance');
    }
  }

  // PageSpeed opportunities
  if (pageSpeed?.mobile?.opportunities) {
    pageSpeed.mobile.opportunities.slice(0, 3).forEach(opp => {
      opportunities.push(`${opp.title}: ${opp.savings}`);
    });
  }

  // Generate recommendations
  const recommendations = generateRecommendations(auditResults, score);

  return {
    score,
    grade: getGrade(score),
    criticalIssues,
    warnings,
    opportunities,
    recommendations,
    summary: generateSummary(score, criticalIssues, warnings, opportunities)
  };
}

/**
 * Calculates overall SEO score (0-100)
 */
function calculateOverallScore(auditResults) {
  let score = 100;
  const { pageSpeed, metaTags, images, technical } = auditResults;

  // PageSpeed impact (30 points)
  if (pageSpeed?.mobile?.performanceScore) {
    const mobileScore = pageSpeed.mobile.performanceScore;
    const desktopScore = pageSpeed.desktop?.performanceScore || mobileScore;
    const avgPerformance = (mobileScore + desktopScore) / 2;
    score -= Math.round((100 - avgPerformance) * 0.3);
  }

  // Critical issues (-10 points each)
  const criticalCount = (metaTags.issues?.length || 0) +
                       (metaTags.headers?.issues?.length || 0);
  score -= criticalCount * 10;

  // Warnings (-5 points each)
  const warningCount = (metaTags.warnings?.length || 0) +
                      (metaTags.headers?.warnings?.length || 0) +
                      (images?.issues?.length || 0);
  score -= warningCount * 5;

  // Image alt text coverage impact (10 points)
  if (images?.coverage) {
    score -= Math.round((100 - images.coverage) * 0.1);
  }

  // Technical SEO impact (15 points)
  if (technical) {
    if (!technical.hasSSL) score -= 15;
    if (!technical.hasRobotsTxt) score -= 3;
    if (!technical.hasSitemap) score -= 3;
  }

  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Returns grade letter based on score
 */
function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Generates actionable recommendations
 */
function generateRecommendations(auditResults, score) {
  const recommendations = [];

  if (score < 70) {
    recommendations.push({
      priority: 'high',
      title: 'Address Critical Issues First',
      description: 'Focus on fixing critical SEO issues like missing meta tags and H1 structure.'
    });
  }

  if (auditResults.pageSpeed?.mobile?.performanceScore < 50) {
    recommendations.push({
      priority: 'high',
      title: 'Improve Page Speed',
      description: 'Page speed significantly impacts SEO. Optimize images, minify CSS/JS, and enable caching.'
    });
  }

  if (auditResults.images?.coverage < 80) {
    recommendations.push({
      priority: 'medium',
      title: 'Add Alt Text to Images',
      description: 'Image alt text improves accessibility and helps search engines understand your content.'
    });
  }

  if (!auditResults.metaTags?.ogTags?.title) {
    recommendations.push({
      priority: 'medium',
      title: 'Add Open Graph Tags',
      description: 'Open Graph tags improve how your content appears when shared on social media.'
    });
  }

  if (!auditResults.technical?.hasSSL) {
    recommendations.push({
      priority: 'critical',
      title: 'Enable HTTPS',
      description: 'HTTPS is essential for security and is a ranking factor for search engines.'
    });
  }

  return recommendations;
}

/**
 * Generates executive summary
 */
function generateSummary(score, criticalIssues, warnings, opportunities) {
  let summary = '';

  if (score >= 80) {
    summary = 'Your site has a strong SEO foundation with minor areas for improvement.';
  } else if (score >= 60) {
    summary = 'Your site has good SEO basics but several issues need attention.';
  } else if (score >= 40) {
    summary = 'Your site has significant SEO issues that should be addressed.';
  } else {
    summary = 'Your site requires immediate SEO attention across multiple areas.';
  }

  summary += ` Found ${criticalIssues.length} critical issue(s), ${warnings.length} warning(s), and ${opportunities.length} optimization opportunity(ies).`;

  return summary;
}

/**
 * Formats report for console output
 */
export function formatConsoleReport(report, url) {
  const lines = [];

  lines.push('');
  lines.push('━'.repeat(60));
  lines.push('          SEO AUDIT REPORT');
  lines.push('━'.repeat(60));
  lines.push('');
  lines.push(`URL: ${url}`);
  lines.push(`Overall Score: ${report.score}/100 (${report.grade})`);
  lines.push('');
  lines.push(`📋 ${report.summary}`);
  lines.push('');

  if (report.criticalIssues.length > 0) {
    lines.push(`🔴 Critical Issues (${report.criticalIssues.length}):`);
    report.criticalIssues.forEach(issue => {
      lines.push(`   • ${issue}`);
    });
    lines.push('');
  }

  if (report.warnings.length > 0) {
    lines.push(`🟡 Warnings (${report.warnings.length}):`);
    report.warnings.forEach(warning => {
      lines.push(`   • ${warning}`);
    });
    lines.push('');
  }

  if (report.opportunities.length > 0) {
    lines.push(`🟢 Opportunities (${report.opportunities.length}):`);
    report.opportunities.forEach(opp => {
      lines.push(`   • ${opp}`);
    });
    lines.push('');
  }

  if (report.recommendations.length > 0) {
    lines.push('💡 Top Recommendations:');
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      lines.push(`   ${i + 1}. ${rec.title}`);
      lines.push(`      ${rec.description}`);
    });
    lines.push('');
  }

  lines.push('━'.repeat(60));
  lines.push('');

  return lines.join('\n');
}
