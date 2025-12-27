import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, Card, Grid, 
  CircularProgress, Alert, Box, Chip, Paper, AppBar, Toolbar, Tooltip as MuiTooltip, useMediaQuery
} from '@mui/material'; 
import { useTheme } from '@mui/material/styles';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; 
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// --- DARK THEME PALETTE ---
const THEME = {
  bg: '#0A1929',          
  cardBg: '#112240',      
  textMain: '#E6F1FF',    
  textLight: '#8892b0',   
  primary: '#64FFDA',     
  secondary: '#10B981',   
  danger: '#FF5555',      
  accent: '#3B82F6',      
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

function App() {
  const [tickers, setTickers] = useState("AAPL, MSFT, GOOGL");
  const [weights, setWeights] = useState("0.4, 0.3, 0.3");
  const [results, setResults] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook to detect screen size for responsive flex direction
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCorrelation(null);

    try {
      const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase());
      const weightArray = weights.split(',').map(w => parseFloat(w.trim()));
      
      const totalWeight = weightArray.reduce((a, b) => a + b, 0);
      if (totalWeight < 0.99 || totalWeight > 1.01) {
        throw new Error(`Weights must sum to 1.0 (Current: ${totalWeight.toFixed(2)})`);
      }

      const payload = { tickers: tickerArray, weights: weightArray };

      const [perfRes, corrRes] = await Promise.all([
        axios.post('http://127.0.0.1:8000/analyze', payload),
        axios.post('http://127.0.0.1:8000/correlation', payload)
      ]);

      setResults(perfRes.data);
      setCorrelation(corrRes.data);

    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const pieData = results ? Object.keys(results.portfolio_allocation).map(key => ({
    name: key,
    value: results.portfolio_allocation[key]
  })) : [];

  const getCorrelationColor = (value) => {
    if (value === 1) return { bg: '#1F2937', text: '#9CA3AF' }; 
    if (value > 0.7) return { bg: 'rgba(239, 68, 68, 0.2)', text: '#FCA5A5' }; 
    if (value > 0.3) return { bg: 'rgba(245, 158, 11, 0.2)', text: '#FCD34D' }; 
    return { bg: 'rgba(16, 185, 129, 0.2)', text: '#6EE7B7' }; 
  };

  const darkInputStyle = {
    bgcolor: 'rgba(255, 255, 255, 0.05)',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      color: THEME.textMain,
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    },
    '& .MuiInputLabel-root': { color: THEME.textLight },
  };

  const topCardStyle = {
    p: 3, 
    borderRadius: '16px', 
    bgcolor: THEME.cardBg, 
    border: '1px solid rgba(255,255,255,0.05)',
    height: '260px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center'
  };

  const bottomCardStyle = {
    p: 3, 
    borderRadius: '16px', 
    bgcolor: THEME.cardBg, 
    border: '1px solid rgba(255,255,255,0.05)',
    height: '450px' 
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: THEME.bg, color: THEME.textMain, minHeight: '100vh', pb: 10, fontFamily: 'Roboto, sans-serif' }}>
      
      {/* HEADER */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(10, 25, 41, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon sx={{ color: THEME.primary, mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div" sx={{ color: THEME.textMain, fontWeight: 800, letterSpacing: '1px' }}>
                QuantFolio
              </Typography>
              <Typography variant="caption" sx={{ color: THEME.textLight, fontWeight: 500 }}>
                PRO Terminal
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" startIcon={<AssessmentOutlinedIcon />} sx={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
            Export Report
          </Button>
        </Toolbar>
      </AppBar>

      {/* Fluid Container (Full Width) */}
      <Container maxWidth={false} sx={{ mt: 5, px: { xs: 2, md: 5 } }}>
        
        {/* INPUTS */}
        <Paper elevation={0} sx={{ p: 4, mb: 5, borderRadius: '16px', bgcolor: THEME.cardBg, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: THEME.textLight, letterSpacing: '1px' }}>ASSETS</Typography>
              <TextField fullWidth variant="outlined" value={tickers} onChange={(e) => setTickers(e.target.value)} sx={darkInputStyle} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: THEME.textLight, letterSpacing: '1px' }}>ALLOCATION</Typography>
              <TextField fullWidth variant="outlined" value={weights} onChange={(e) => setWeights(e.target.value)} sx={darkInputStyle} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box mt={3.5}>
                <Button variant="contained" size="large" fullWidth onClick={handleAnalyze} disabled={loading} sx={{ height: '56px', bgcolor: THEME.primary, color: THEME.bg, fontWeight: 'bold' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "RUN ANALYSIS"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {results && (
          <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
             <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* --- TOP ROW (GRID) --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={topCardStyle}>
                  <Typography variant="body2" sx={{ color: THEME.textLight, mb: 1, fontWeight: 600, letterSpacing: '1px' }}>ANNUAL RETURN</Typography>
                  <Typography variant="h3" sx={{ color: THEME.secondary, fontWeight: 800, mb: 2 }}>{results.expected_annual_return}%</Typography>
                  <Chip label="Expected Performance" size="small" sx={{ bgcolor: `${THEME.secondary}15`, color: THEME.secondary, fontWeight: 600 }} />
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={topCardStyle}>
                  <Typography variant="body2" sx={{ color: THEME.textLight, mb: 1, fontWeight: 600, letterSpacing: '1px' }}>RISK (VOLATILITY)</Typography>
                  <Typography variant="h3" sx={{ color: THEME.danger, fontWeight: 800, mb: 2 }}>{results.volatility_risk}%</Typography>
                  <Chip label="Standard Deviation" size="small" sx={{ bgcolor: `${THEME.danger}15`, color: THEME.danger, fontWeight: 600 }} />
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={topCardStyle}>
                  <Typography variant="body2" sx={{ color: THEME.textLight, mb: 1, fontWeight: 600, letterSpacing: '1px' }}>SHARPE RATIO</Typography>
                  <Typography variant="h3" sx={{ color: THEME.primary, fontWeight: 800, mb: 2 }}>{results.sharpe_ratio}</Typography>
                  <Chip label="Risk-Adjusted Return" size="small" sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 600 }} />
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={topCardStyle}>
                  <Typography variant="body2" sx={{ color: THEME.textLight, mb: 1, fontWeight: 600, letterSpacing: '1px', alignSelf: 'center' }}>ALLOCATION</Typography>
                  <Box sx={{ width: '100%', height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={50} 
                          outerRadius={70} 
                          paddingAngle={5} 
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', bgcolor: THEME.cardBg, border: 'none' }} itemStyle={{color: THEME.textMain}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box display="flex" justifyContent="center" gap={1} mt={-1}>
                    {pieData.map((entry, index) => (
                       <Box key={index} display="flex" alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS[index], mr: 0.5 }} />
                          <Typography variant="caption" color={THEME.textLight}>{entry.name}</Typography>
                       </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* --- BOTTOM ROW: FLEXBOX LAYOUT (Fixed + Fluid) --- */}
            {/* This replaces Grid for the bottom row to guarantee the chart takes all remaining space */}
            <Box 
              display="flex" 
              flexDirection={isDesktop ? 'row' : 'column'} 
              gap={3}
            >
              
              {/* 1. Correlation Matrix (Fixed Width on Desktop) */}
              <Box sx={{ width: isDesktop ? '380px' : '100%', flexShrink: 0 }}>
                <Paper elevation={0} sx={bottomCardStyle}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.textMain, mr: 1, fontSize: '1rem' }}>Correlation</Typography>
                    <MuiTooltip title="Red = High Risk. Green = Low Risk." arrow>
                      <InfoOutlinedIcon fontSize="small" sx={{ color: THEME.textLight }} />
                    </MuiTooltip>
                  </Box>
                  
                  {correlation && (
                    <Box display="grid" gridTemplateColumns={`repeat(${correlation.labels.length + 1}, 1fr)`} gap={1} mt={5}>
                      <Box></Box>
                      {correlation.labels.map(l => (
                        <Box key={l} sx={{ fontSize: 10, fontWeight: 700, color: THEME.textLight, textAlign: 'center', mb: 1 }}>{l}</Box>
                      ))}
                      {correlation.matrix.map((row, i) => (
                        <React.Fragment key={i}>
                          <Box sx={{ fontSize: 10, fontWeight: 700, color: THEME.textLight, display: 'flex', alignItems: 'center' }}>{correlation.labels[i]}</Box>
                          {row.map((val, j) => {
                            const colors = getCorrelationColor(val);
                            return (
                              <MuiTooltip key={`${i}-${j}`} title={`Correlation: ${val.toFixed(2)}`} arrow>
                                <Box 
                                  sx={{ 
                                    bgcolor: colors.bg, color: colors.text,
                                    height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: 11, fontWeight: 700, borderRadius: '8px', border: `1px solid ${colors.text}20`,
                                    cursor: 'default', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                >
                                  {val.toFixed(2)}
                                </Box>
                              </MuiTooltip>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 2. Growth Projection (Fluid - Takes All Remaining Space) */}
              <Box sx={{ flexGrow: 1, width: isDesktop ? 'auto' : '100%' }}>
                <Paper elevation={0} sx={bottomCardStyle}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.textMain }}>Growth Projection ($10k)</Typography>
                    <Chip label="1 Year Historical" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: THEME.textLight, fontWeight: 600 }} />
                  </Box>
                  
                  <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.growth_chart}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: THEME.textLight}} minTickGap={40} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `$${val/1000}k`} tick={{fontSize: 12, fill: THEME.textLight}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', bgcolor: THEME.cardBg, border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: THEME.primary }} />
                        <Area type="monotone" dataKey="value" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>

            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;