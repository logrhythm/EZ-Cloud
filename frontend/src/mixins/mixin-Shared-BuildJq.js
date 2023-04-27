// mixin-Shared-BuildJq.js

import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('mainStore', ['jqFilterTemplate', 'jqTransformTemplate'])
  }, // computed

  methods: {
    sanitisePathName (pathName) {
      // This is now superceeded by the sanitisation done in `MappingEdit.vue` / `processLogKey`.
      return pathName

      // // Sanitise the Path Name
      // let safePathName = pathName
      // if (
      //   pathName &&
      //   String(pathName).includes('@')
      // ) {
      //   // Break the path into component
      //   const pathComponents = String(pathName).split('.')
      //   const safePathComponents = []
      //   // Suround each component with quotes that contains the '@' sign
      //   pathComponents.forEach((pc) => {
      //     safePathComponents.push(
      //       (
      //         String(pc).includes('@')
      //           ? `"${pc}"`
      //           : pc
      //       )
      //     )
      //     // if (String(pc).includes('@')) {
      //     //   pc = `"${pc}"`
      //     // }
      //   })
      //   safePathName = safePathComponents.join('.')
      // }
      // return safePathName
    },
    buildJqFilterFromParams (pipelineUid, pipelineName, beatName, loggedInUser) {
      let jqFilter = ''
      // webhookbeat_254_EH_254a3
      const beatFullyDistinguishedName =
        String(beatName).toLowerCase() +
        '_' +
        String(
          pipelineUid.substring(0, 3) +
          '_' +
          pipelineName.replace(/[^a-zA-Z0-9]/g, '_') +
          '_' +
          pipelineUid
        )
          .substring(0, 12)

      // First pass to change the headers and static fields
      jqFilter = this.jqFilterTemplate
        .replace(/{{EZ_generation_timestamp}}/g, (new Date()).toISOString())
        .replace(/{{EZ_generation_user}}/g, loggedInUser)
        .replace(/{{EZ_stream_name_placeholder}}/g, pipelineName)
        .replace(/{{EZ_stream_id_placeholder}}/g, pipelineUid)
        .replace(/{{EZ_compact_stream_name_placeholder}}/g, String(pipelineName).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase())
        .replace(/{{EZ_beat_name_placeholder}}/g, beatName)
        .replace(/{{EZ_beat_fully_distinguished_name_placeholder}}/g, beatFullyDistinguishedName)

      // And ship it back
      return jqFilter
    },

    buildJqTransformFromParams ({ pipelineUid, pipelineName, beatName, loggedInUser, extractMessageFieldOnly, messageFieldPath, jsonPathes }) {
      let jqTransform = ''

      // First pass to change the headers and static fields
      jqTransform = this.jqTransformTemplate
        .replace(/{{EZ_generation_timestamp}}/g, (new Date()).toISOString())
        .replace(/{{EZ_generation_user}}/g, loggedInUser)
        .replace(/{{EZ_stream_name_placeholder}}/g, pipelineName)
        .replace(/{{EZ_stream_id_placeholder}}/g, pipelineUid)
        .replace(/{{EZ_compact_stream_name_placeholder}}/g, String(pipelineName).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase())
        .replace(/{{EZ_beat_name_placeholder}}/g, beatName)

      // What do we use for original_message?
      let originalMessagePlaceholder = '. | tojson'
      let messagePlaceholder = '.input'
      const messageRootNonDottedPlaceholder = 'message'
      if (extractMessageFieldOnly) {
        originalMessagePlaceholder = messageFieldPath
        messagePlaceholder = `.${messageRootNonDottedPlaceholder}`
      }

      // Fanning out the log
      const flattenArrays = [] // array of the IDs
      const flattenArrayPlaceholder = []
      const flattenArrayPlaceholderTemplate = '        "{{EZ_flatten_array_id}}": flatten_array({{EZ_message_root}}{{EZ_flatten_array_field_path}}),'
      const flattenArrayAddFieldPlaceholderTemplate = '    add_field(.{{EZ_flatten_array_name_placeholder}}{{EZ_flatten_array_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      const flattenArrayAddFieldPlaceholder = [] // multiple strings

      // Extracting the Beat's message
      const beatOriginalMessageTemplate = (
        extractMessageFieldOnly
          ? '        "{{EZ_message_root_non_dotted_placeholder}}": if {{EZ_message_field_path}} != null then ({{EZ_message_field_path}} | fromjson) else {} end,'
          : ''
      )

      // Mapping of the Timestamp field(s)
      // const timestampAddFieldPlaceholderTemplate = '    add_field(({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}{{EZ_date_parser_placeholder}}); .output.normal_msg_date) |'
      const timestampAddFieldPlaceholderTemplate = '    add_field((if {{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}} != null then ({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}{{EZ_date_parser_placeholder}}) else null end); .output.normal_msg_date) |'
      const dateParserIso8601Template = ' | fromdate' // Used for Timestamp - ISO8601 format
      const timestampAddFieldPlaceholder = [] // multiple strings

      // Mapping of the fields
      const addFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      const addFieldPlaceholder = [] // multiple strings

      // MDI Sub-rules
      const subRulesAddFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_tag_placeholder}}) |'
      const subRulesAddFieldPlaceholder = []

      let messageRoot = ''
      if (extractMessageFieldOnly) {
        messageRoot = messageFieldPath + ' | fromjson | '
      }

      // Fanning out the log and Sub Rules
      jsonPathes.forEach(path => {
        if (path.modifiers && path.modifiers.length) {
          path.modifiers.forEach(pm => {
            if (pm === 'Fan out') {
              const flattenArrayId = 'flatten_array_' + path.name.replace(/[^a-zA-Z0-9]/g, '_')
              flattenArrays.push(this.sanitisePathName(path.name))

              flattenArrayPlaceholder.push(
                flattenArrayPlaceholderTemplate
                  .replace(/{{EZ_flatten_array_id}}/g, flattenArrayId)
                  .replace(/{{EZ_message_root}}/g, messageRoot)
                  .replace(/{{EZ_flatten_array_field_path}}/g, this.sanitisePathName(path.name))
              )
            } else if (pm === 'Sub Rule selector') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag1')
              )
            } else if (pm === 'Sub Rule qualifier 1') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag2')
              )
            } else if (pm === 'Sub Rule qualifier 2') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag3')
              )
            } else if (pm === 'Sub Rule qualifier 3') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag4')
              )
            } else if (pm === 'Sub Rule qualifier 4') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag5')
              )
            }
          })
        }
      })

      jsonPathes.forEach(path => {
        // First check if the field is part (sub branch) of a Fanned out branch
        let isSubFannedOutBranch = false
        let flattenArrayPathName = ''
        if ((path.mappedField && path.mappedField.length) || (path.modifiers && path.modifiers.length)) {
          flattenArrays.forEach(fa => {
            if (
              path.name &&
              path.name.indexOf(fa) === 0 &&
              fa.length > flattenArrayPathName.length
            ) {
              flattenArrayPathName = fa
              isSubFannedOutBranch = true
            }
          })
        }

        // Sanitise the Path Name
        const safePathName = this.sanitisePathName(path.name)

        // Mapping of the fields
        if (path.mappedField && path.mappedField.length) {
          if (isSubFannedOutBranch) {
            // Field is a Sub of a Fanned out branch
            flattenArrayAddFieldPlaceholder.push(
              flattenArrayAddFieldPlaceholderTemplate
                .replace(
                  /{{EZ_flatten_array_name_placeholder}}/g,
                  'flatten_array_' + flattenArrayPathName.replace(/[^a-zA-Z0-9]/g, '_') // rebuild the flatten array ID
                )
                .replace(
                  /{{EZ_flatten_array_field_doted_path_placeholder}}/g,
                  safePathName
                    .replace(flattenArrayPathName, '') // Remove the part of the path that is the flatten array's own path
                    .replace(/\[\d+\]/, '') // remove any array numerical ID (like [0], [1], etc...)
                )
                .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
            )
          } else {
            // Standard field
            addFieldPlaceholder.push(
              addFieldPlaceholderTemplate
                .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                .replace(/{{EZ_field_doted_path_placeholder}}/g, safePathName)
                .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
            )
          }
        }

        // Mapping the Timestamp field(s)
        if (path.modifiers && path.modifiers.length) {
          path.modifiers.forEach(pm => {
            if (
              (pm === 'Timestamp selector - ISO8601 format') ||
              (pm === 'Timestamp selector - Unix Timestamp format')
            ) {
              // Setup the date/time parser first
              let dateParser = ''
              if (
                (pm === 'Timestamp selector - ISO8601 format')
              ) {
                dateParser = dateParserIso8601Template
              }

              if (isSubFannedOutBranch) {
                // Field is a Sub of a Fanned out branch
                timestampAddFieldPlaceholder.push(
                  timestampAddFieldPlaceholderTemplate
                    .replace(
                      /{{EZ_message_placeholder}}/g,
                      'flatten_array_' + flattenArrayPathName.replace(/[^a-zA-Z0-9]/g, '_') // rebuild the flatten array ID
                    )
                    .replace(
                      /{{EZ_field_doted_path_placeholder}}/g,
                      this.sanitisePathName(path.name)
                        .replace(flattenArrayPathName, '') // Remove the part of the path that is the flatten array's own path
                        .replace(/\[\d+\]/, '') // remove any array numerical ID (like [0], [1], etc...)
                    )
                    .replace(
                      /{{EZ_date_parser_placeholder}}/g,
                      dateParser
                    )
                )
              } else {
                // Standard field
                timestampAddFieldPlaceholder.push(
                  timestampAddFieldPlaceholderTemplate
                    .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                    .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
                    .replace(/{{EZ_date_parser_placeholder}}/g, dateParser)
                )
              }
            }
          })
        }

        // // MDI Sub-rules
        // if (path.mappedField && path.mappedField.length && path.mappedField.indexOf('tag') === 0) {
        //   subRulesAddFieldPlaceholder.push(
        //     subRulesAddFieldPlaceholderTemplate
        //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
        //       .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
        //       .replace(/{{EZ_mdi_tag_placeholder}}/g, path.mappedField)
        //   )
        // }
      })

      // // const addFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      // // const addFieldPlaceholder = [] // multiple strings
      // jsonPathes.forEach(path => {
      //   // // Mapping of the fields
      //   // if (path.mappedField && path.mappedField.length) {
      //   //   addFieldPlaceholder.push(
      //   //     addFieldPlaceholderTemplate
      //   //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
      //   //       .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
      //   //       .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
      //   //   )
      //   // }
      // })

      // // MDI Sub-rules
      // // const subRulesAddFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_tag_placeholder}}) |'
      // // const subRulesAddFieldPlaceholder = []
      // jsonPathes.forEach(path => {
      //   // // MDI Sub-rules
      //   // if (path.mappedField && path.mappedField.length && path.mappedField.indexOf('tag') === 0) {
      //   //   subRulesAddFieldPlaceholder.push(
      //   //     subRulesAddFieldPlaceholderTemplate
      //   //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
      //   //       .replace(/{{EZ_field_doted_path_placeholder}}/g, this.sanitisePathName(path.name))
      //   //       .replace(/{{EZ_mdi_tag_placeholder}}/g, path.mappedField)
      //   //   )
      //   // }
      // })

      // Put this all together
      jqTransform = jqTransform
        .replace(/{{EZ_beat_message_extraction_placeholder}}/g, beatOriginalMessageTemplate)
        .replace(/{{EZ_message_field_path}}/g, messageFieldPath)
        .replace(/{{EZ_message_root_non_dotted_placeholder}}/g, messageRootNonDottedPlaceholder)
        .replace(/{{EZ_flatten_array_placeholder}}/g, flattenArrayPlaceholder.join('\n'))
        .replace(/{{EZ_original_message_placeholder}}/g, originalMessagePlaceholder)
        .replace(/{{EZ_timestamp__add_field_placeholder}}/g, timestampAddFieldPlaceholder.join('\n'))
        .replace(/{{EZ_flatten_array__add_field_placeholder}}/g, flattenArrayAddFieldPlaceholder.join('\n'))
        .replace(/{{EZ_add_field_placeholder}}/g, addFieldPlaceholder.join('\n'))
        .replace(/{{EZ_sub_rules__add_field_placeholder}}/g, subRulesAddFieldPlaceholder.join('\n'))

      // And ship it back
      return jqTransform
    }
  } // method
}
