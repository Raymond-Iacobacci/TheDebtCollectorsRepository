import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types'

export default function PaymentsView({tenantID}){
    return (
        <Typography variant="h4">Payments</Typography>

    );
}
PaymentsView.propTypes = {
    tenantID: PropTypes.string,
};