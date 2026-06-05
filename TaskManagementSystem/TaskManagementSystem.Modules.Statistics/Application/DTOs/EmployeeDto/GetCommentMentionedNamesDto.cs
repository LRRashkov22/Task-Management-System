using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.EmployeeDto;

        public class GetCommentMentionedNamesDto
        {
           public int Id { get; set; }
           public string Username { get; set; } = string.Empty;
        }
