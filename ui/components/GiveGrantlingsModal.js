import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Box, TextField, Button, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Card from "./styled/Card";
import { DREAM_QUERY } from "../pages/[dream]";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center"
  },
  innerModal: {
    outline: "none"
  }
}));

const GIVE_GRANT = gql`
  mutation Grant($dreamId: ID!, $value: Int!) {
    grant(dreamId: $dreamId, value: $value) {
      value
    }
  }
`;

const GiveGrantlingsModal = ({
  open,
  handleClose,
  dream,
  event,
  currentMember
}) => {
  const classes = useStyles();
  const router = useRouter();

  const [giveGrant] = useMutation(GIVE_GRANT, {
    update(cache, { data: { grant } }) {
      const { dream } = cache.readQuery({
        query: DREAM_QUERY,
        variables: { slug: router.query.dream, eventId: event.id }
      });

      cache.writeQuery({
        query: DREAM_QUERY,
        data: {
          dream: {
            ...dream,
            currentNumberOfGrants: dream.currentNumberOfGrants + grant.value
          }
        }
      });
    }
  });
  const { handleSubmit, register, errors } = useForm();

  // TODO: show available grantlings in modal
  // TODO: show how many I have given
  // TODO: allow me to remove given grantlings

  return (
    <Modal
      // aria-labelledby="simple-modal-title"
      // aria-describedby="simple-modal-description"
      open={open}
      onClose={handleClose}
      className={classes.modal}
    >
      <Card className={classes.innerModal}>
        <Box p={3}>
          <h1>Give grantlings to dream!</h1>

          <form
            onSubmit={handleSubmit(variables => {
              giveGrant({
                variables: {
                  dreamId: dream.id,
                  value: Number(variables.value)
                }
              })
                .then(data => {
                  // Add "Snackbar" success message from material UI
                  handleClose();
                })
                .catch(error => {
                  alert(error.message);
                });
            })}
          >
            <Box m="15px 0">
              <TextField
                name="value"
                defaultValue="1"
                inputRef={register}
                fullWidth
                inputProps={{
                  type: "number",
                  min: "1",
                  max: "5"
                }}
                variant="outlined"
              />
            </Box>
            <Button
              type="submit"
              size="large"
              fullWidth
              variant="contained"
              color="primary"
            >
              Donate grantlings
            </Button>
          </form>
        </Box>
      </Card>
    </Modal>
  );
};

export default GiveGrantlingsModal;
