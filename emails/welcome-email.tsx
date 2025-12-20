import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

const WelcomeEmail = ({
  name = "User",
}: {
  name?: string;
} = {}) => (
  <Html>
    <Head />
    <Preview>Welcome to AI Diagnostic</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text className="text-red-600" style={heading}>
            Welcome, {name}!
          </Text>
          <Text style={paragraph}>
            Thank you for signing up for AI Diagnostic. We're excited to help
            you get started.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f9fafb",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

export default WelcomeEmail;
