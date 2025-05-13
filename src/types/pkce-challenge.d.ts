declare module 'pkce-challenge' {
  interface PKCEChallenge {
    code_verifier: string;
    code_challenge: string;
  }

  function pkceChallenge(length?: number): PKCEChallenge;
  export default pkceChallenge;
}