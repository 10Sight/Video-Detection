// Mock Authentication Logic
// No real DB for users, just hardcoded checks for the demo

exports.login = (req, res) => {
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Role is required' });
    }

    // Simulate successful login based on role selection
    if (role === 'Official Authority') {
        return res.json({
            success: true,
            user: {
                id: 'user_official_123',
                name: 'Ministry Official',
                role: 'Official Authority',
            },
            token: 'mock_token_official_authority_xyz',
        });
    } else if (role === 'PIB Fact Check') {
        return res.json({
            success: true,
            user: {
                id: 'user_pib_456',
                name: 'PIB Verifier',
                role: 'PIB Fact Check',
            },
            token: 'mock_token_pib_fact_check_abc',
        });
    } else {
        return res.status(400).json({ message: 'Invalid Role Selected' });
    }
};
