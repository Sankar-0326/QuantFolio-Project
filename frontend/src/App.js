import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Card, Grid,
  CircularProgress, Alert, Box, Chip, Paper, AppBar, Toolbar, Tooltip as MuiTooltip, useMediaQuery,
  List, ListItem, ListItemIcon, ListItemText, Divider, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleIcon from '@mui/icons-material/Article';

// --- PREMIUM LIGHT THEME PALETTE (FINTECH) ---
const THEME = {
  bg: '#F8FAFC',          // Slate 50
  cardBg: '#FFFFFF',      // White
  textMain: '#0F172A',    // Slate 900
  textLight: '#64748B',   // Slate 500
  primary: '#2563EB',     // Blue 600
  secondary: '#10B981',   // Emerald 500
  danger: '#EF4444',      // Red 500
  accent: '#8B5CF6',      // Violet 500
  border: '#E2E8F0',      // Slate 200
};

const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// Mock Live Signals Data
const LIVE_NEWS = [
  { id: 1, text: "Fed Chair Powell Speech @ 2PM", type: "critical", time: "10m ago" },
  { id: 2, text: "Tech Sector Rally: NVDA +4%", type: "positive", time: "32m ago" },
  { id: 3, text: "Oil Prices Dip Below $70", type: "neutral", time: "1h ago" },
  { id: 4, text: "Eurozone Inflation Cools", type: "positive", time: "2h ago" },
];

const ECONOMIC_CALENDAR = [
  { id: 1, time: "08:30", event: "Non-Farm Payrolls", impact: "High", actual: "250K", forecast: "190K" },
  { id: 2, time: "10:00", event: "ISM Manufacturing PMI", impact: "Medium", actual: "49.2", forecast: "48.5" },
  { id: 3, time: "14:00", event: "FOMC Meeting Minutes", impact: "High", actual: "-", forecast: "-" },
  { id: 4, time: "16:30", event: "Crude Oil Inventories", impact: "Low", actual: "-", forecast: "-2.1M" },
];

// Stock Options List
const STOCK_OPTIONS = [
  { label: "Apple Inc.", symbol: "AAPL" },
  { label: "Microsoft Corp.", symbol: "MSFT" },
  { label: "Alphabet Inc. (Google)", symbol: "GOOGL" },
  { label: "Amazon.com Inc.", symbol: "AMZN" },
  { label: "NVIDIA Corp.", symbol: "NVDA" },
  { label: "Tesla Inc.", symbol: "TSLA" },
  { label: "Meta Platforms", symbol: "META" },
  { label: "Berkshire Hathaway", symbol: "BRK-B" },
  { label: "JPMorgan Chase", symbol: "JPM" },
  { label: "Visa Inc.", symbol: "V" },
  { label: "Johnson & Johnson", symbol: "JNJ" },
  { label: "Walmart Inc.", symbol: "WMT" },
  { label: "Procter & Gamble", symbol: "PG" },
  { label: "Mastercard Inc.", symbol: "MA" },
  { label: "Home Depot", symbol: "HD" },
];

function App() {
  const [selectedAssets, setSelectedAssets] = useState([
    STOCK_OPTIONS[0], // AAPL
    STOCK_OPTIONS[1], // MSFT
    STOCK_OPTIONS[2]  // GOOGL
  ]);
  const [weights, setWeights] = useState("0.4, 0.3, 0.3");
  const [results, setResults] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCorrelation(null);

    try {
      if (selectedAssets.length === 0) {
        throw new Error("Please select at least one asset.");
      }

      const tickerArray = selectedAssets.map(asset => asset.symbol);
      const weightArray = weights.split(',').map(w => parseFloat(w.trim()));

      const totalWeight = weightArray.reduce((a, b) => a + b, 0);
      if (totalWeight < 0.99 || totalWeight > 1.01) {
        throw new Error(`Weights must sum to 1.0 (Current: ${totalWeight.toFixed(2)})`);
      }

      if (tickerArray.length !== weightArray.length) {
        throw new Error(`Asset count (${tickerArray.length}) doesn't match weight count (${weightArray.length}).`);
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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const pieData = results ? Object.keys(results.portfolio_allocation).map(key => ({
    name: key,
    value: results.portfolio_allocation[key]
  })) : [];

  const getCorrelationColor = (value) => {
    if (value === 1) return { bg: '#F1F5F9', text: '#94A3B8' };
    if (value > 0.7) return { bg: '#FEF2F2', text: '#EF4444' };
    if (value > 0.3) return { bg: '#FFFBEB', text: '#F59E0B' };
    return { bg: '#ECFDF5', text: '#10B981' };
  };

  const inputStyle = {
    bgcolor: '#FFFFFF',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      color: THEME.textMain,
      '& fieldset': { borderColor: THEME.border },
      '&:hover fieldset': { borderColor: THEME.primary },
      '&.Mui-focused fieldset': { borderColor: THEME.primary, borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { color: THEME.textLight },
  };

  const cardStyle = {
    p: 3,
    borderRadius: '16px',
    bgcolor: THEME.cardBg,
    border: `1px solid ${THEME.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)',
      borderColor: `${THEME.primary}40`,
      transform: 'translateY(-2px)'
    }
  };

  const topCardStyle = {
    ...cardStyle,
    height: '260px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const bottomCardStyle = {
    ...cardStyle,
    height: '100%',
    minHeight: '450px'
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: THEME.bg, color: THEME.textMain, minHeight: '100vh', pb: 10, fontFamily: '"Inter", "Roboto", sans-serif' }}>

      {/* HEADER */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${THEME.border}` }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <Box sx={{ bgcolor: THEME.primary, p: 0.5, borderRadius: '8px', mr: 2, display: 'flex' }}>
              <TrendingUpIcon sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ color: THEME.textMain, fontWeight: 800, letterSpacing: '-0.5px' }}>
                QuantFolio
              </Typography>
              <Typography variant="caption" sx={{ color: THEME.textLight, fontWeight: 600, letterSpacing: '0.5px' }}>
                PRO TERMINAL
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" startIcon={<AssessmentOutlinedIcon />} sx={{ borderColor: THEME.border, color: THEME.textMain, borderRadius: '12px', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: THEME.textMain, bgcolor: 'transparent' } }}>
            Export Report
          </Button>
        </Toolbar>
      </AppBar>

      {/* Fluid Container (Full Width) */}
      <Container maxWidth={false} sx={{ mt: 5, px: { xs: 2, md: 5 } }}>

        {/* INPUTS */}
        <Paper elevation={0} sx={{ p: 4, mb: 5, borderRadius: '24px', bgcolor: THEME.cardBg, border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: THEME.textMain, fontWeight: 700 }}>ASSETS</Typography>
              <Autocomplete
                multiple
                options={STOCK_OPTIONS}
                getOptionLabel={(option) => option.label}
                value={selectedAssets}
                onChange={(event, newValue) => {
                  setSelectedAssets(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.symbol}`}
                      size="small"
                      {...getTagProps({ index })}
                      sx={{ bgcolor: '#EFF6FF', color: THEME.primary, fontWeight: 700, borderRadius: '8px', border: `1px solid ${THEME.primary}20` }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={selectedAssets.length === 0 ? "Search assets (e.g. Apple)..." : ""}
                    sx={inputStyle}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.symbol === value.symbol}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: THEME.textMain, fontWeight: 700 }}>ALLOCATION</Typography>
              <TextField
                fullWidth
                placeholder="e.g. 0.4, 0.3"
                value={weights}
                onChange={(e) => setWeights(e.target.value)}
                sx={inputStyle}
                helperText={`${weights.split(',').length} weights for ${selectedAssets.length} assets`}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box mt={3.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleAnalyze}
                  disabled={loading}
                  sx={{
                    height: '56px',
                    bgcolor: THEME.primary,
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "RUN ANALYSIS"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        {results && (
          <Box>
            {/* --- TOP ROW (Key Metrics) --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: "ANNUAL RETURN", val: `${results.expected_annual_return}%`, sub: "Expected Performance", color: THEME.secondary, bg: '#ECFDF5' },
                { label: "RISK (VOLATILITY)", val: `${results.volatility_risk}%`, sub: "Standard Deviation", color: THEME.danger, bg: '#FEF2F2' },
                { label: "SHARPE RATIO", val: results.sharpe_ratio, sub: "Risk-Adjusted Return", color: THEME.primary, bg: '#EFF6FF' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} lg={3} key={idx}>
                  <motion.div {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                    <Card elevation={0} sx={topCardStyle}>
                      <Typography variant="caption" sx={{ color: THEME.textLight, mb: 1, fontWeight: 700, letterSpacing: '0.5px' }}>{item.label}</Typography>
                      <Typography variant="h3" sx={{ color: THEME.textMain, fontWeight: 800, mb: 2, letterSpacing: '-1px' }}>{item.val}</Typography>
                      <Chip label={item.sub} size="small" sx={{ bgcolor: item.bg, color: item.color, fontWeight: 700, borderRadius: '8px' }} />
                    </Card>
                  </motion.div>
                </Grid>
              ))}

              <Grid item xs={12} sm={6} lg={3}>
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card elevation={0} sx={topCardStyle}>
                    <Typography variant="caption" sx={{ color: THEME.textLight, mb: 1, fontWeight: 700, letterSpacing: '0.5px' }}>ALLOCATION</Typography>
                    <Box sx={{ width: '100%', height: '140px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                      {pieData.map((entry, index) => (
                        <Box key={index} display="flex" alignItems="center" mr={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS[index], mr: 0.5 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: THEME.textLight }}>{entry.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* --- MIDDLE ROW: CORRELATION & GROWTH (Reverted Layout) --- */}
            <Box
              display="flex"
              flexDirection={isDesktop ? 'row' : 'column'}
              gap={3}
              mb={4}
            >
              {/* 1. Correlation Matrix (Fixed Width on Desktop) */}
              <Box sx={{ width: isDesktop ? '380px' : '100%', flexShrink: 0 }}>
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }} style={{ height: '100%' }}>
                  <Paper elevation={0} sx={bottomCardStyle}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.textMain, mr: 1, fontSize: '1rem' }}>Asset Correlation</Typography>
                      <MuiTooltip title="Red = High Risk (Identical moves). Green = Low Risk (Diversified)." arrow>
                        <InfoOutlinedIcon fontSize="small" sx={{ color: THEME.textLight }} />
                      </MuiTooltip>
                    </Box>

                    {correlation && (
                      <Box display="grid" gridTemplateColumns={`repeat(${correlation.labels.length + 1}, 1fr)`} gap={1} mt={2}>
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
                                      fontSize: 11, fontWeight: 700, borderRadius: '8px',
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
                </motion.div>
              </Box>

              {/* 2. Growth Forecast (Fluid) */}
              <Box sx={{ flexGrow: 1 }}>
                <motion.div {...fadeInUp} transition={{ delay: 0.5 }} style={{ height: '100%' }}>
                  <Paper elevation={0} sx={bottomCardStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.textMain }}>Growth Forecast</Typography>
                        <Typography variant="caption" sx={{ color: THEME.textLight }}>Initial Investment: $10,000</Typography>
                      </Box>
                      <Chip label="AI Prediction" size="small" icon={<BoltIcon style={{ color: THEME.accent }} />} sx={{ bgcolor: '#F5F3FF', color: THEME.accent, fontWeight: 700, border: `1px solid ${THEME.accent}20` }} />
                    </Box>

                    <Box sx={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.growth_chart}>
                          <defs>
                            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={THEME.secondary} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fill: THEME.textLight }} minTickGap={40} axisLine={false} tickLine={false} />
                          <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `$${val / 1000}k`} tick={{ fontSize: 12, fill: THEME.textLight }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', bgcolor: '#fff', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: THEME.textMain }} />

                          <Area
                            type="monotone"
                            dataKey="value"
                            data={results.growth_chart.filter(d => d.type === 'Historical')}
                            stroke={THEME.primary}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHistorical)"
                            name="Historical"
                          />

                          <Area
                            type="monotone"
                            dataKey="value"
                            data={results.growth_chart.filter(d => d.type === 'Predicted' || d === results.growth_chart.findLast(x => x.type === 'Historical'))}
                            stroke={THEME.secondary}
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorPredicted)"
                            name="AI Forecast"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </motion.div>
              </Box>
            </Box>

            {/* --- BOTTOM ROW: LIVE MARKETS & CALENDAR --- */}
            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <Paper elevation={0} sx={bottomCardStyle}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabIndex} onChange={handleTabChange} aria-label="market tabs">
                    <Tab icon={<ArticleIcon />} iconPosition="start" label="Live News" sx={{ fontWeight: 600, textTransform: 'none' }} />
                    <Tab icon={<CalendarTodayIcon />} iconPosition="start" label="Economic Calendar" sx={{ fontWeight: 600, textTransform: 'none' }} />
                  </Tabs>
                </Box>

                {/* LIVE NEWS TAB */}
                {tabIndex === 0 && (
                  <List>
                    {LIVE_NEWS.map((signal, idx) => (
                      <React.Fragment key={signal.id}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                            <FiberManualRecordIcon sx={{
                              fontSize: 12,
                              color: signal.type === 'critical' ? THEME.danger :
                                signal.type === 'positive' ? THEME.secondary :
                                  signal.type === 'warning' ? THEME.accent : THEME.textLight
                            }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 600, color: THEME.textMain }}>{signal.text}</Typography>}
                            secondary={<Typography variant="caption" sx={{ color: THEME.textLight }}>{signal.time}</Typography>}
                          />
                          <Button size="small" sx={{ ml: 'auto', color: THEME.primary, fontWeight: 600 }}>Read</Button>
                        </ListItem>
                        {idx < LIVE_NEWS.length - 1 && <Divider component="li" sx={{ borderColor: THEME.border }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}

                {/* ECONOMIC CALENDAR TAB */}
                {tabIndex === 1 && (
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="economic calendar">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: THEME.textLight, fontWeight: 700 }}>Time</TableCell>
                          <TableCell sx={{ color: THEME.textLight, fontWeight: 700 }}>Event</TableCell>
                          <TableCell sx={{ color: THEME.textLight, fontWeight: 700 }}>Impact</TableCell>
                          <TableCell align="right" sx={{ color: THEME.textLight, fontWeight: 700 }}>Actual</TableCell>
                          <TableCell align="right" sx={{ color: THEME.textLight, fontWeight: 700 }}>Forecast</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ECONOMIC_CALENDAR.map((row) => (
                          <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ color: THEME.textMain, fontWeight: 600 }}>{row.time}</TableCell>
                            <TableCell sx={{ color: THEME.textMain }}>{row.event}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.impact}
                                size="small"
                                sx={{
                                  bgcolor: row.impact === 'High' ? `${THEME.danger}15` : row.impact === 'Medium' ? `${THEME.accent}15` : `${THEME.secondary}15`,
                                  color: row.impact === 'High' ? THEME.danger : row.impact === 'Medium' ? THEME.accent : THEME.secondary,
                                  fontWeight: 700
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME.textMain, fontWeight: 600 }}>{row.actual}</TableCell>
                            <TableCell align="right" sx={{ color: THEME.textLight }}>{row.forecast}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </motion.div>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;