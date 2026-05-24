namespace TaskManagementSystem.Data.Options
{
    public class CorsOptions
    {
        public string PolicyName { get; set; } = string.Empty;

        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    }
}
