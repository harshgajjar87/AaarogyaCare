# Gemini API Rate Limits & Usage Guide

## Gemini 2.5 Flash (gemini-2.0-flash-exp) - Free Tier

### Rate Limits
| Metric | Limit |
|--------|-------|
| Requests per minute (RPM) | 15 |
| Requests per day (RPD) | 1,500 |
| Tokens per minute (TPM) | 1,000,000 |
| Tokens per day (TPD) | Unlimited |

## Daily Usage Estimates

### Based on Current Implementation:

#### 1. General Health Prediction
- **Tokens per request**: ~6,000-8,000 (comprehensive analysis)
- **Daily capacity**: ~187 predictions (1,500 requests ÷ 8)
- **Realistic usage**: 50-100 predictions/day

#### 2. Report Analysis
- **Tokens per request**: ~4,000-6,000 (detailed analysis)
- **Daily capacity**: ~250 analyses (1,500 requests ÷ 6)
- **Realistic usage**: 100-200 analyses/day

#### 3. AI Report Extraction
- **Tokens per request**: ~1,000-2,000 (field extraction)
- **Daily capacity**: ~750 extractions (1,500 requests ÷ 2)
- **Realistic usage**: 200-400 extractions/day

#### 4. Chatbot
- **Tokens per request**: ~300-500 (conversational)
- **Daily capacity**: ~3,000 messages (1,500 requests ÷ 0.5)
- **Realistic usage**: 500-1,000 messages/day

#### 5. Triage Chat
- **Tokens per request**: ~100-200 (short responses)
- **Daily capacity**: ~7,500 messages (1,500 requests ÷ 0.2)
- **Realistic usage**: 1,000-2,000 messages/day

## Total Daily Capacity

With intelligent distribution across features:
- **Health Predictions**: 50-100
- **Report Analyses**: 100-200
- **Report Extractions**: 200-400
- **Chatbot Messages**: 500-1,000
- **Triage Messages**: 1,000-2,000

**Total**: Approximately 1,850-3,700 AI operations per day

## Rate Limit Handling

### Current Implementation:
1. **Primary**: Gemini 2.5 Flash
2. **Fallback**: Groq API (when Gemini fails or rate limited)
3. **Last Resort**: Rule-based responses (chatbot only)

### When Rate Limit is Hit:
- Gemini returns 429 error
- System automatically falls back to Groq
- No user-facing errors
- Seamless experience

## Optimization Strategies

### 1. Request Batching
- Group similar requests when possible
- Reduce redundant API calls

### 2. Caching
- Cache common chatbot responses
- Store frequently accessed report analyses
- Implement TTL-based cache invalidation

### 3. Smart Routing
- Route simple queries to rule-based system
- Use Gemini for complex medical analysis only
- Implement query complexity detection

### 4. Token Optimization
- Reduce system prompt length where possible
- Implement prompt compression techniques
- Use shorter responses for simple queries

### 5. Load Distribution
- Distribute load across multiple API keys (if available)
- Implement queue system for non-urgent requests
- Prioritize critical features (health predictions, report analysis)

## Monitoring & Alerts

### Recommended Metrics to Track:
1. **API Usage**
   - Requests per hour/day
   - Token consumption
   - Success/failure rates

2. **Fallback Frequency**
   - How often Groq is used
   - Reasons for fallback (rate limit vs error)

3. **Response Times**
   - Gemini average response time
   - Groq average response time
   - Overall system latency

4. **User Experience**
   - Failed requests (after all fallbacks)
   - User-reported issues
   - Feature usage patterns

### Alert Thresholds:
- **Warning**: 80% of daily limit used
- **Critical**: 95% of daily limit used
- **Action Required**: Consistent rate limit hits

## Scaling Options

### When Free Tier is Insufficient:

#### Option 1: Gemini Paid Tier
- Higher rate limits
- Better SLA
- Priority support

#### Option 2: Multiple API Keys
- Rotate between keys
- Distribute load
- Increase effective limits

#### Option 3: Hybrid Approach
- Use Gemini for premium features
- Use Groq for standard features
- Implement tiered service levels

#### Option 4: Self-Hosted Models
- Deploy open-source models
- Full control over resources
- Higher initial cost, lower operational cost

## Best Practices

### 1. Error Handling
```javascript
try {
  // Try Gemini
  const response = await callGeminiAPI();
} catch (error) {
  if (error.status === 429) {
    // Rate limit hit - use fallback
    const response = await callGroqAPI();
  } else {
    // Other error - log and retry
    console.error('Gemini error:', error);
  }
}
```

### 2. Exponential Backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 3. Request Queuing
```javascript
const queue = [];
const processQueue = async () => {
  while (queue.length > 0) {
    const request = queue.shift();
    await processRequest(request);
    await sleep(4000); // 15 RPM = 1 request per 4 seconds
  }
};
```

## Cost Comparison

### Gemini 2.5 Flash (Free Tier)
- **Cost**: $0
- **Limit**: 1,500 requests/day
- **Best for**: Development, small-scale production

### Groq (Free Tier)
- **Cost**: $0
- **Limit**: ~1,000 requests/day per model
- **Best for**: Fallback, high-speed inference

### OpenAI GPT-3.5-turbo
- **Cost**: $0.50 per 1M input tokens, $1.50 per 1M output tokens
- **Limit**: High (pay-as-you-go)
- **Best for**: Production with budget

### Estimated Monthly Costs (if paid):
- **Gemini**: $0 (free tier sufficient for current usage)
- **Groq**: $0 (free tier as fallback)
- **OpenAI**: ~$50-100/month (if used as primary)

## Recommendations

### Current Setup (Optimal):
1. Use Gemini 2.5 Flash as primary (free, fast, accurate)
2. Use Groq as fallback (free, reliable)
3. Use OpenAI for chatbot fallback only (minimal cost)

### For Growth:
1. Monitor usage patterns
2. Implement caching early
3. Optimize prompts for token efficiency
4. Consider paid tier when approaching limits
5. Implement usage analytics dashboard

## Support & Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Rate Limits**: https://ai.google.dev/pricing
- **Groq Docs**: https://console.groq.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs

## Conclusion

The current implementation with Gemini 2.5 Flash as primary and Groq as fallback provides:
- **Zero cost** for typical usage
- **High reliability** with multi-tier fallback
- **Excellent performance** with fast response times
- **Scalability** with clear upgrade path

The free tier limits are sufficient for:
- Development and testing
- Small to medium production deployments
- Up to ~2,000-3,000 AI operations per day
